import os
import json
import random
import gower
import itertools
import numpy as np
import pandas as pd
from datetime import datetime
from matplotlib import pyplot as plt

from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

from sklearn import metrics
from sklearn.cluster import DBSCAN as dbscan

DATASET_DIR = "E:/_PROJECT/flask_reactjs/api/upload"
RESULT_DIR = "E:/_PROJECT/flask_reactjs/api/result"

now = datetime.now()
first_time = now.strftime("%H:%M:%S")

def data_mining_process():

    # --- IMPORT DATASET --- #
    # 1. READ DATA FROM FILE FOLDER #
    df = pd.read_csv(f"{DATASET_DIR}/data.csv")
    df.drop(["no", "date", "suspect_age", "victim_age",
            "material_loss"], axis="columns", inplace=True)
    df.columns = ["day", "time", "address", "district", "accident_types",
                  "suspect_vehicle", "victim_vehicle", "MD", "LB", "LR"]

    # --- DATA PREPROCESSING --- #
    # 1. DATA CLEANING #
    # If NaN value exist, we will remove it from our dataset
    df = df.replace('NaN', np.nan)
    df = df.dropna()

    # remove white space in address & district
    df["address"] = df["address"].map(lambda x: str(x).strip().lower())
    df["district"] = df["district"].map(lambda x: str(x).strip().lower())

    # 2. DATA TRANSFORMATION #
    df["time"] = pd.to_datetime(df['time'], format='%H:%M').dt.hour

    # transform vehicle types
    exception = ["TR", "TX", "Rro", "NOV"]

    df["suspect_vehicle"] = df.suspect_vehicle.apply(lambda x: "TR" if(
        len(x) > 1 and x not in exception and int(x[1:]) >= 6) else x)
    df["victim_vehicle"] = df.victim_vehicle.apply(lambda x: "TR" if(
        len(x) > 1 and x not in exception and int(x[1:]) >= 6) else x)

    df["suspect_vehicle"] = df["suspect_vehicle"].replace(
        "T", "TX").replace("-", "NOV")
    df["victim_vehicle"] = df["victim_vehicle"].replace(
        "T", "TX").replace("-", "NOV")

   
    # REDUCE DUPLICATE ADDRESS & DISTRICT BEFORE TRANSFORM INTO COORDINATE
    df_map = df.copy()
    df_map = df_map.drop_duplicates(subset=['address', 'district'])
    df_map.reset_index(drop=True, inplace=True)

    # transform physical address to coodinate
    location_df = df_map[["address", "district"]].copy()
    location_df['lat'] = ''
    location_df['long'] = ''
    locator = Nominatim(user_agent="skripsi_app")
    count = 0
    for i in range(len(location_df)):
        try:
            count = count+1
            address = "jalan " + \
                (location_df["address"][i]+', ' +
                 location_df["district"][i]).strip()
            location = locator.geocode(address, timeout=None)

            if location != None:
                location_df['lat'][i] = location.latitude
                location_df['long'][i] = location.longitude

            else:
                print(f"[{count}]. {address}")
                location_df['lat'][i] = np.nan
                location_df['long'][i] = np.nan

        except GeocoderTimedOut as e:
            print("Error: geocode failed on input %s with message %s" %
                  (address, e.message))

    loc_result = df.merge(location_df, how='left', left_on=[
                          'address', 'district'], right_on=['address', 'district'])

    # READ CONVERTED ADDRESS FILE
    my_df = loc_result.copy()
    my_df = my_df.dropna()

    return dbscan_clustering(my_df)


def dbscan_clustering(my_df):

    # 1. SET PARAMS
    ft_eps = np.arange(2, 8)
    ft_minPts = np.arange(3, 9)
    ft_params = list(itertools.product(ft_eps, ft_minPts))

    # 1. GowerDistance - Find optimal hyperparameters by iterating through a range of eps and minpts
    df_features = my_df[["day", "time", "accident_types",
                         "suspect_vehicle", "victim_vehicle"]].copy()
    distance_matrix = gower.gower_matrix(df_features)
    df_gower = pd.DataFrame(distance_matrix)


    # DBSCAN CLUSTERING START #
    ft_clusters = []
    ft_sil_score = []
    ft_eps = []
    ft_minPts = []
    ft_labels = []

    for p in ft_params:
        ft_dbc = dbscan(eps=p[0]/100, min_samples=p[1], metric="precomputed").fit(df_gower)
        labels = ft_dbc.labels_
        ft_eps.append(p[0]/100)
        ft_minPts.append(p[1])
        ft_clusters.append(len(np.unique(labels)))
        ft_sil_score.append(metrics.silhouette_score(df_gower, labels)) if len(
            np.unique(labels)) > 1 else "Null"
        ft_labels.append(labels)

    params = list(zip(ft_clusters, ft_sil_score, ft_eps, ft_minPts))
    params_df = pd.DataFrame(
        params, columns=['clusters', 'silhouette_score', 'eps', 'min_pts'])

    if not os.path.isdir(RESULT_DIR):
      os.mkdir(RESULT_DIR)

    # FIND OPTIMAL CLUSTER
    c1_cls = params_df.clusters > 5
    c2_score = params_df.silhouette_score > 0
    c3_pts = params_df.min_pts > 5
    filter_df = params_df[c1_cls & c2_score & c3_pts]

    if filter_df.shape[0] == 0:
        return "can't find optimal cluster", 424

    filter_df2 = filter_df[filter_df.silhouette_score ==
                           filter_df.silhouette_score.max()]
    filter_df3 = filter_df2[filter_df2.min_pts == filter_df2.min_pts.max()]
    filter_df3

    # SELECT CHOOSEN PARAMETERS
    index = filter_df3.index[0]
    eps = filter_df3["eps"].iloc[0]
    pts = filter_df3["min_pts"].iloc[0]
    labels = ft_labels[index]
    sil_score = filter_df3["silhouette_score"].iloc[0]
    no_clusters = ft_clusters[index]
    no_noise = list(labels).count(-1)

    choosen_params = {
        "eps": eps,
        "minPts": pts,
        "clusters": no_clusters,
        "noise": no_noise,
        "labels": labels,
        "silhouette_score": sil_score
    }

   # REMOVE NOISE FROM OUR DATA
    result_df = my_df.copy()
    result_df["Cluster"] = labels
    result_df = result_df.loc[result_df["Cluster"] != -1]
    result_df["time"] = result_df["time"].map(lambda x: str(x)+":00")

    return visualization(result_df, choosen_params)


def visualization(df, params):

    data = df.copy()
    list_colors = ["#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
                   for i in range(params['clusters'])]

    # create color for each clusters
    list_clusters = np.unique(params['labels'])

    data["Color"] = data["Cluster"].apply(lambda x:
                                          list_colors[list_clusters[x]])

    data.to_csv(f"{RESULT_DIR}/result.csv", index=False)
    data["address"] = data["address"].map(lambda x: x.replace("'", ""))
    
    labels = params['labels']
    labels = np.delete(labels, np.where(labels == -1))
    result = []
    for i in np.unique(labels):
        result.append({
            "cluster": i,
            "total": len(data.loc[data["Cluster"] == i]),
            "days": np.unique(data.loc[data["Cluster"] == i]["day"].values).tolist(),
            "time": np.unique(data.loc[data["Cluster"] == i]["time"].values).tolist(),
            "accident_types": np.unique(data.loc[data["Cluster"] == i]["accident_types"].values).tolist(),
            "vehicle_types": np.unique(data.loc[data["Cluster"] == i]["victim_vehicle"].values).tolist() + np.unique(data.loc[data["Cluster"] == i]["suspect_vehicle"].values).tolist(),
            "address": np.unique(data.loc[data["Cluster"] == i]["address"].values + ", " + data.loc[data["Cluster"] == i]["district"].values).tolist()
        })


    with open(f"{RESULT_DIR}/result.json", 'w') as my_file:
        json.dump(str(result), my_file)

    now2 = datetime.now()
    first_time2 = now2.strftime("%H:%M:%S")

    return {
        "json_file": '/result.json',
        "start": first_time,
        "stop": first_time2,
        "result": str(params)
    }

# data_mining_process()
