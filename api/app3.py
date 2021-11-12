import os
import json
import random
import itertools
import numpy as np              
import pandas as pd
from datetime import datetime

# opensource geographic map developed by openstreetmap.org 
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut


from sklearn import metrics
from sklearn.decomposition import PCA
from sklearn.cluster import DBSCAN as dbscan
from sklearn.preprocessing import LabelBinarizer
from sklearn_pandas import DataFrameMapper



#DATASET_DIR = "E:/_PROJECT/flask_reactjs/api/upload"
#RESULT_DIR = "E:/_PROJECT/flask_reactjs/api/result"
DATASET_DIR = "./upload"
RESULT_DIR = "./result"

execute_start = datetime.now().strftime("%H:%M:%S")

def processing():
    # --- IMPORT DATASET --- #
    # 1. READ DATA FROM FILE FOLDER #
    df = pd.read_csv(f"{DATASET_DIR}/data.csv")
    if len(df) > 7000:
      df = df[-7000:].copy()
      df.reset_index(drop=True, inplace=True)
      
    df.drop(["no", "date", "suspect_age", "victim_age", "MD", "LB", "LR",
            "material_loss"], axis="columns", inplace=True)
    df.columns = ["day", "time", "address", "district", "accident_types",
                  "suspect_vehicle", "victim_vehicle"]

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

    def conv_time(hour):
      if 5<=hour<=11:
        return "Morning"
      elif 12<=hour<=17:
          return "Afternoon"
      elif 18<=hour<=22:
          return "Evening"
      else:
          return "Night"
    
    df["time"] = df["time"].map(lambda x: conv_time(x))

    exception = ["TR","Rro", "NOV"]
    df["suspect_vehicle"] = df.suspect_vehicle.apply(lambda x: "TR" if(len(x)>1 and x not in exception and int(x[1:])>=6) else x)
    df["victim_vehicle"] = df.victim_vehicle.apply(lambda x: "TR" if(len(x)>1 and x not in exception and int(x[1:])>=6) else x)

    df["suspect_vehicle"] = df["suspect_vehicle"].replace("T", "R4").replace("-", "NOV")
    df["victim_vehicle"] = df["victim_vehicle"].replace("T", "R4").replace("-", "NOV")

    # REDUCE DUPLICATE ADDRESS & DISTRICT BEFORE TRANSFORM INTO COORDINATE
    location_df = df[["address", "district"]].copy()
    location_df = location_df.drop_duplicates(subset=['address', 'district'])
    location_df.reset_index(drop=True, inplace=True)

    # transform physical address to coodinate
    location_df['lat'] = ''
    location_df['long'] = ''
    locator = Nominatim(user_agent="my_app3")
    count = 0

    for i in range(len(location_df)):
        try:
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
          count = count+1
        except GeocoderTimedOut as e:
            print("Error: geocode failed on input %s with message %s" %
                  (address, e.message))
    print('finish')
    location_merged = df.merge(location_df, how='left', left_on=['address', 'district'], right_on=['address', 'district'])
    location_merged = location_merged.dropna()


    # FEATURES TRANSFORMATION #
    # location_merged = pd.read_csv(f"{DATASET_DIR}/data_with_coordinates.csv")
    features_df = location_merged[["day", "time", "accident_types", "suspect_vehicle", "victim_vehicle"]].copy()

    label_features = features_df.copy()

    d_label = LabelBinarizer()
    day_label = d_label.fit_transform(label_features["day"])
    day_mapping = [label for index, label in enumerate(d_label.classes_)]

    t_label = LabelBinarizer()
    time_label = t_label.fit_transform(label_features["time"])
    time_mapping = [label for index, label in enumerate(t_label.classes_)]

    types_label = LabelBinarizer()
    accident_label = types_label.fit_transform(label_features["accident_types"])
    accident_mapping = [label for index, label in enumerate(types_label.classes_)]

    victim_label = LabelBinarizer()
    victim_vehicle_label = victim_label.fit_transform(label_features["victim_vehicle"])
    victim_mapping = [label for index, label in enumerate(victim_label.classes_)]

    suspect_label = LabelBinarizer()
    suspect_vehicle_label = suspect_label.fit_transform(label_features["suspect_vehicle"])
    suspect_mapping = [label for index, label in enumerate(suspect_label.classes_)]
        
    label = day_mapping + time_mapping +accident_mapping + suspect_mapping + victim_mapping
    unique_label = list(dict.fromkeys(label))
    unique_label.remove("NOV")

    mapper = DataFrameMapper([
     ('day', LabelBinarizer()),
     ('time', LabelBinarizer()),
     ('accident_types', LabelBinarizer()),
     ('suspect_vehicle', LabelBinarizer()),
     ('victim_vehicle', LabelBinarizer()),
    ])

    mapper_scaled = mapper.fit_transform(features_df)

    df_encoded = pd.DataFrame(mapper_scaled, columns=[label])
    df_encoded.drop(["NOV"], axis="columns", inplace=True)
    df_encoded = df_encoded.groupby(level=0,axis=1).sum()
    df_encoded = df_encoded[unique_label]
    minPts = df_encoded.shape[1]*2-1
    """
    Due to combining the suspect and victim vehicle types allows the occurrence of 
    label 1 increase.. below is the code to keep it at 1 even though the same attributes 
    have been merged
    """
    df_encoded[unique_label] = df_encoded[unique_label].where(~(df_encoded[unique_label]>1),other=1)


    # DIMENSIONALITY REDUCTION #
    pca = PCA(n_components=3).fit(df_encoded)
    pca2 = pca.transform(df_encoded)
    pca_df = pd.DataFrame(pca2)

 
    return dbscan_clustering(minPts, location_merged, pca_df)

def calculate_SSE(sse_df, eps, minpts):
    clusters_point = {}
    sse = {}
    
    sse_df = sse_df.loc[sse_df["Label"] != -1]
    
    for index, row in sse_df.iterrows():
        label = row["Label"].astype(int)

        if label not in clusters_point:
            temp_df = sse_df.copy()
            temp_df = temp_df.loc[temp_df["Label"] == label]

            column_0_sum = format(temp_df[0].sum()/temp_df.shape[0], ".6f")
            column_1_sum = format(temp_df[1].sum()/temp_df.shape[0], ".6f")
            column_2_sum = format(temp_df[2].sum()/temp_df.shape[0], ".6f")

            core_point = [column_0_sum, column_1_sum, column_2_sum]
            clusters_point[label] = core_point

        x = row[0]
        y = row[1]
        z = row[2]
        
        corepoint = np.array(clusters_point[label]).astype(float)
        sse_formula = ((x - corepoint[0])**2) + ((y - corepoint[1])**2) + ((z - corepoint[2])**2)

        if label in sse:
            prev_sse = sse[label]
            sse_cluster = prev_sse + sse_formula        
            sse[label] = sse_cluster

        else:
            sse[label] = sse_formula

    values = sse.values()    
    SSE = sum(values)
    return SSE

def dbscan_clustering(min_samples, df, pca_df):
  
  # TUNING HYPERPARAMETERS
  clusters = []
  sil_score = []
  sil_percentage = []
  SSE = []
  epsilon = []
  minPts = []
  cluster_labels = []
  no_noise = []

  list_eps = np.arange(1, 30)

  for p in list_eps:
    dbc = dbscan(eps=p/100, min_samples=min_samples).fit(pca_df)
    labels = dbc.labels_
    no_noise.append(list(labels).count(-1))
    
    sse_df = pca_df.copy()
    sse_df['Label'] = labels
    sse_value = calculate_SSE(sse_df, eps=p/100, minpts=53)
    SSE.append(sse_value)
    
    labels = np.delete(labels, np.where(labels == -1))
    
    epsilon.append(p/100)
    minPts.append(53)
    
    clusters.append(len(np.unique(labels)))
    
    score_df = sse_df.loc[sse_df["Label"] != -1]
    score = float(metrics.silhouette_score(score_df, labels)) if len(np.unique(labels)) > 1 else "Null"
    sil_score.append("%.3f" % score if type(score) == float else np.nan)
    sil_percentage.append("%.1f" % (((score+1)/2)*100) + " %" if type(score) == float else np.nan)
    
    cluster_labels.append(labels)

  params = list(zip(clusters, epsilon, minPts, SSE, sil_score, no_noise))
  params_df = pd.DataFrame(params, columns=['clusters', 'eps', 'min_pts','SSE','silhouette_score', 'number_of_noises'])

  params_df['silhouette_score'] = pd.to_numeric(params_df['silhouette_score'])
  filter_df = params_df[(params_df.silhouette_score > 0.9) & (params_df.SSE < 200)]
  filter_df = filter_df[filter_df.number_of_noises == filter_df.number_of_noises.min()]
  filter_df = filter_df[filter_df.clusters == filter_df.clusters.min()]

  choosenEps = 0.23
  if len(filter_df) >= 1:
    choosenEps = filter_df["eps"].iloc[0]

  dbc = dbscan(eps=choosenEps, min_samples=min_samples).fit(pca_df)
  labels = dbc.labels_
  df['Cluster'] = labels
  df = df.loc[df["Cluster"] != -1]
  labels = np.delete(labels, np.where(labels == -1))

  group_df = df.copy()
  group_df['Count'] = 1
  group_df = group_df.groupby(['address', 'district', 'lat', 'long', 'Cluster']).Count.count().reset_index()
  group_df = group_df.loc[group_df['Count'] >=6 ]

  new_df = pd.merge(group_df, df, on=['address', 'district', 'lat', 'long', 'Cluster'])
  new_df = new_df.drop_duplicates(subset=['address', 'district', 'lat', 'long', 'Cluster'])
  new_df.reset_index(drop=True, inplace=True)
  no_clusters = np.unique(labels)
  print(no_clusters)
  colors = ["#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
                for i in range(len(no_clusters))]

  # create color for each clusters
  new_df["Color"] = new_df["Cluster"].apply(lambda x: colors[no_clusters[x]])
  new_clusters = list(np.unique(new_df['Cluster'].values.tolist()))
  new_df['Cluster'] = new_df['Cluster'].apply(lambda x: new_clusters.index(x))
  if not os.path.isdir(RESULT_DIR):
    os.mkdir(RESULT_DIR)

  new_df.to_csv(f"{RESULT_DIR}/result.csv", index=False)

  # Save result in json
  new_df["address"] = new_df["address"].map(lambda x: x.replace("'", ""))
  result = []

  reset_clusters = [i for i in range(0, len(new_clusters))]
  for i in np.unique(reset_clusters):
    vehicle_types = (list(dict.fromkeys(list(np.unique(new_df.loc[new_df["Cluster"]==i]["victim_vehicle"].values)) + list(np.unique(new_df.loc[new_df["Cluster"]==i]["suspect_vehicle"].values)))))
    vehicle_types.remove("NOV") if "NOV" in vehicle_types else vehicle_types

    result.append({
        "cluster": i,
        "color": np.unique(new_df.loc[new_df['Cluster'] == i]['Color'].values).tolist(),
        "total": len(new_df.loc[new_df["Cluster"] == i]),
        "days": np.unique(new_df.loc[new_df["Cluster"] == i]["day"].values).tolist(),
        "time": np.unique(new_df.loc[new_df["Cluster"] == i]["time"].values).tolist(),
        "accident_types": np.unique(new_df.loc[new_df["Cluster"] == i]["accident_types"].values).tolist(),
        "vehicle_types": vehicle_types,
        "address": np.unique(new_df.loc[new_df["Cluster"] == i]["address"].values + ", " + new_df.loc[new_df["Cluster"] == i]["district"].values).tolist()
    })

  with open(f"{RESULT_DIR}/result.json", 'w') as my_file:
    json.dump(str(result), my_file)
  
  execute_stop = datetime.now().strftime("%H:%M:%S")
  print("execute_start: ", execute_start)
  print("execute_stop: ", execute_stop) 

  return {
    "start": execute_start,
    "stop": execute_stop,
  }


# processing()
