import os
import time
import math
import json
import random
import folium
import itertools
import numpy as np              
import pandas as pd
from datetime import datetime
from matplotlib import pyplot as plt

import geopy
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

from sklearn import metrics
from sklearn.cluster import DBSCAN as dbscan
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import MinMaxScaler

DATASET_DIR = "E:/_PROJECT/flask_reactjs/api/files"
RESULT_DIR = "E:/_PROJECT/flask_reactjs/api/result"

def data_mining_process(file_name):

  # --- IMPORT DATASET --- #
  # 1. READ DATA FROM FILE FOLDER #
  df = pd.read_csv(f"{DATASET_DIR}/{file_name}.csv")
  df.drop(["no", "date", "suspect_age", "victim_age", "material_loss"], axis="columns", inplace=True)
  df.columns = ["day", "time", "address", "district", "accident_types", "suspect_vehicle", "victim_vehicle", "MD", "LB", "LR"]
  
  # 2. GET ALL UNIQUE VALUE FROM FEATURES (DAY, ACCIDENT_TYPES, SUSPECT_VEHICLE, VICTIM_VEHICLE) #
  days = df["day"].unique()
  accident_types = df["accident_types"].unique()
  suspect_vehicle = df["suspect_vehicle"].unique()
  victim_vehicle = df["victim_vehicle"].unique()

  # --- DATA PREPROCESSING --- #
  # 1. DATA CLEANING #
  # If NaN value exist, we will remove it from our dataset
  df = df.replace('NaN', np.nan) 
  df = df.dropna() 
  
  # remove white space in address & district
  df["address"] = df["address"].map(lambda x: str(x).strip().lower())
  df["district"] = df["district"].map(lambda x: str(x).strip().lower())
  # 2. DATA TRANSFORMATION #
  # change time by simply taking only hour value and labeling days value
  d_label = LabelEncoder()
  day_label = d_label.fit_transform(df["day"])
  day_mapping = {index: label for index, label in enumerate(d_label.classes_)}

  df["day"] = day_label
  df["time"] = pd.to_datetime(df['time'], format = '%H:%M').dt.hour


  # transform vehicle types
  exception = ["TR", "TX", "Rro", "NOV"]

  df["suspect_vehicle"] = df.suspect_vehicle.apply(lambda x: "TR" if(len(x)>1 and x not in exception and int(x[1:])>=6) else x)
  df["victim_vehicle"] = df.victim_vehicle.apply(lambda x: "TR" if(len(x)>1 and x not in exception and int(x[1:])>=6) else x)

  df["suspect_vehicle"] = df["suspect_vehicle"].replace("T", "TX").replace("-", "NOV")
  df["victim_vehicle"] = df["victim_vehicle"].replace("T", "TX").replace("-", "NOV")


  # transform victim and suspect vehicle to LabelEncoder
  victim_label = LabelEncoder()
  victim_vehicle_label = victim_label.fit_transform(df["victim_vehicle"])
  victim_mapping = {index: label for index, label in enumerate(victim_label.classes_)}

  suspect_label = LabelEncoder()
  suspect_vehicle_label = suspect_label.fit_transform(df["suspect_vehicle"])
  suspect_mapping = {index: label for index, label in enumerate(suspect_label.classes_)}

  df["victim_vehicle"] = victim_vehicle_label
  df["suspect_vehicle"] = suspect_vehicle_label
  
  # accident_types labeling
  types_label = LabelEncoder()
  accident_label = types_label.fit_transform(df["accident_types"])
  accident_mapping = {index: label for index, label in enumerate(types_label.classes_)}
  df["accident_types"] = accident_label
  
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
      count=count+1
      address = "jalan "+ (location_df["address"][i]+', '+ location_df["district"][i]).strip()
      location = locator.geocode(address, timeout=None)
      
      if location != None:
        location_df['lat'][i] = location.latitude
        location_df['long'][i] = location.longitude
          
      else:
        print(f"[{count}]. {address}")
        location_df['lat'][i] = np.nan
        location_df['long'][i] = np.nan  
            
    except GeocoderTimedOut as e:
      print("Error: geocode failed on input %s with message %s"%(address, e.message))

  if not os.path.isdir(RESULT_DIR):
    os.mkdir(RESULT_DIR)

  loc_result = df.merge(location_df,how='left', left_on=['address', 'district'], right_on=['address', 'district'])
  print(loc_result.shape)
  print(loc_result.head(20))
  loc_result.to_csv(f"{RESULT_DIR}/{file_name}_coordinates.csv", index=False)  

  # READ CONVERTED ADDRESS FILE
  my_df = loc_result.copy()
  my_df = my_df.dropna()

  decoders = {
    "d_label": d_label,
    "types_label": types_label,
    "victim_label": victim_label,
    "suspect_label": suspect_label
  }
  return dbscan_clustering(my_df, decoders, RESULT_DIR, file_name)

def dbscan_clustering(my_df, decoders, dir, file_name):
  
  # 1. MinMaxScaler - Find optimal hyperparameters by iterating through a range of eps and minpts 
  df_features = my_df[["day", "time", "accident_types", "suspect_vehicle", "victim_vehicle"]].copy()
  ft_minmax = MinMaxScaler(feature_range=(0,1)).fit(df_features)
  ft_minmax_scaled = ft_minmax.transform(df_features)

  df_ft_minmax = pd.DataFrame(ft_minmax_scaled, columns=df_features.columns)
  
  ft_eps = np.arange(2, 10)
  ft_minPts = np.arange(3,13)
  ft_params = list(itertools.product(ft_eps, ft_minPts))

  # DBSCAN CLUSTERING START #
  ft_clusters = []
  ft_sil_score = []
  ft_eps = []
  ft_minPts = []
  ft_labels = []

  for p in ft_params:
      ft_dbc = dbscan(eps=p[0]/100, min_samples=p[1]).fit(df_ft_minmax)
      labels = ft_dbc.labels_
      ft_eps.append(p[0]/100)
      ft_minPts.append(p[1])
      ft_clusters.append(len(np.unique(labels)))
      ft_sil_score.append(metrics.silhouette_score(df_ft_minmax,labels)) if len(np.unique(labels)) > 1 else "Null"
      ft_labels.append(labels)
      
  params = list(zip(ft_clusters, ft_sil_score, ft_eps, ft_minPts))
  params_df = pd.DataFrame(params, columns=['clusters', 'silhouette_score', 'eps', 'min_pts'])

  # Plot the resulting Silhouette scores on a graph
  plt.figure(figsize=(16,8), dpi=300)
  plt.plot(ft_sil_score, 'bo-', color='black')
  plt.xlabel('Epsilon/100 | MinPts')
  plt.ylabel('Silhouette Score')
  plt.title('Silhouette Score based on different combnation of Hyperparameters')
  plt.savefig(f"{dir}/{file_name}.png")

  # FIND OPTIMAL CLUSTER
  c1_cls = params_df.clusters > 5
  c2_score = params_df.silhouette_score > 0
  c3_pts = params_df.min_pts > 5
  filter_df = params_df[c1_cls & c2_score & c3_pts]

  if filter_df.shape[0] == 0:
      print("can't find optimal cluster")
      
  filter_df2 = filter_df[filter_df.silhouette_score == filter_df.silhouette_score.max()]
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

  print("labels     : ", labels)
  print("choosen_eps: ", eps)
  print("choosen_pts: ", pts)
  print("sil_score  : ", sil_score)
  print("no_clusters: ", no_clusters)
  print("no_noise   : ", no_noise)

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

  result_df["day"] = decoders["d_label"].inverse_transform(result_df["day"])
  result_df["time"] = result_df["time"].map(lambda x: str(x)+":00")
  result_df["accident_types"] = decoders["types_label"].inverse_transform(result_df["accident_types"])
  result_df["suspect_vehicle"] = decoders["suspect_label"].inverse_transform(result_df["suspect_vehicle"])
  result_df["victim_vehicle"] = decoders["victim_label"].inverse_transform(result_df["victim_vehicle"])

  return visualization(result_df, choosen_params, dir, file_name)

def visualization(df, params, dir, file_name):

  # get location
  city = "Makassar"
  locator = geopy.geocoders.Nominatim(user_agent="MyCoder")
  location = locator.geocode(city)
  location = [location.latitude, location.longitude]

  x, y = "lat", "long"
  color = "Cluster"
  data = df.copy()
  list_colors = ["#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
             for i in range(params['clusters'])]

  # create color for each clusters
  list_clusters = np.unique(params['labels'])

  data["Color"] = data["Cluster"].apply(lambda x: 
                  list_colors[list_clusters[x]])

  result = []
  for i in np.unique(params['labels']):
    result.append({
      "cluster": i,
      "total": len(data.loc[data["Cluster"]==i]),
      "days": np.unique(data.loc[data["Cluster"]==i]["day"].values),
      "time": np.unique(data.loc[data["Cluster"]==i]["time"].values),
      "address": np.unique(data.loc[data["Cluster"]==i]["address"].values + ", " + data.loc[data["Cluster"]==i]["district"].values)
    })
  
  with open(f"{dir}/{file_name}.json", 'w') as my_file:
    json.dump(str(result), my_file)

  # CREATE MAP VISUALIZATION

  ## initialize the map with the starting location
  map_ = folium.Map(location=location, tiles="cartodbpositron",
                    zoom_start=15)

  ## add points
  data.apply(lambda row: folium.CircleMarker(
            location=[row[x],row[y]], 
            popup="[Cluster {}] \n{}, {}".format(row["Cluster"], row["address"], row["district"]),
            max_width=1000,
            color=row["Color"], fill=True,
            radius=7).add_to(map_), axis=1)

  ## add html legend
  legend_html = """<div style="position:fixed; bottom:10px; left:10px; border:2px solid black; z-index:9999; font-size:14px;">&nbsp;<b>"""+color+""":</b><br>"""
  for i in list_clusters:
      legend_html = legend_html+"""&nbsp;<i class="fa fa-circle 
      fa-1x" style="color:"""+list_colors[list_clusters[i]]+"""">
      </i>&nbsp;"""+str(i)+"""<br>"""
  legend_html = legend_html+"""</div>"""
  map_.get_root().html.add_child(folium.Element(legend_html))

  ## plot the map
  map_.save(f"{dir}/{file_name}.html")
  return "done"

# data_mining_process("data")