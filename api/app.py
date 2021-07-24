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
  df = pd.read_csv(f"{DATASET_DIR}/{file_name}")
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
  df["address"] = df["address"].str.strip()
  df["district"] = df["district"].str.strip()

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
  label = LabelEncoder()
  accident_label = label.fit_transform(df["accident_types"])
  accident_mapping = {index: label for index, label in enumerate(label.classes_)}
  df["accident_types"] = accident_label

  # transform physical address to coodinate
  # location_df = df[["address", "district"]].copy()
  # location_df['lat'] = ''
  # location_df['long'] = ''
  # locator = Nominatim(user_agent="my_app3")
  # count = 0

  # here we'll loop through our new_df dataset, get the address and district name and change it 
  #into lat and long

  # for i in range(len(location_df)):
  #   try:
  #     count=count+1
  #     address = "Jalan "+ (location_df["address"][i]+', '+ location_df["district"][i]).strip()
  #     location = locator.geocode(address, timeout=8)
      
  #     if location != None:
  #       location_df['lat'][i] = location.latitude
  #       location_df['long'][i] = location.longitude
          
  #     else:
  #       print(f"[{count}]. {address}")
  #       location_df['lat'][i] = '0'
  #       location_df['long'][i] = '0'  
            
  #   except GeocoderTimedOut as e:
  #     print("Error: geocode failed on input %s with message %s"%(address, e.message))
  # if not os.path.isdir(RESULT_DIR):
  #   os.mkdir(RESULT_DIR)
  address_file = f"{RESULT_DIR}/{file_name}"
  # location_df.to_csv(address_file, index=False)  
  # return "done"

  # READ CONVERTED ADDRESS FILE
  address = pd.read_csv(f"{RESULT_DIR}/addresses.csv")
  

  # MERGE DATAFRAME
  df1 = address[["lat", "long"]].copy()
  df2 = df[["address", "district", "day", "time", "accident_types", "suspect_vehicle", "victim_vehicle"]].copy()
  my_df = pd.concat([df1, df2], axis=1, join="inner")

  return time_db_clustering(my_df, d_label)

def time_db_clustering(my_df, d_label):

  # 1. MinMaxScaler - Find optimal hyperparameters by iterating through a range of eps and minpts 
  df_time = my_df[["day", "time"]].copy()
  time_minmax = MinMaxScaler(feature_range=(0,1)).fit(df_time)
  time_minmax_scaled = time_minmax.transform(df_time)
  df_time_minmax = pd.DataFrame(time_minmax_scaled, columns=df_time.columns)

  t_eps = np.arange(2, 10)
  t_minPts = np.arange(3,13)

  t_params = list(itertools.product(t_eps, t_minPts))

  # DBSCAN CLUSTERING PROCESS
  time_clusters = []
  time_sil_score = []
  time_eps = []
  time_minPts = []
  labels = []

  for p in t_params:
      time_dbc = dbscan(eps=p[0]/100, min_samples=p[1]).fit(df_time_minmax)
      time_labels = time_dbc.labels_
      time_eps.append(p[0]/100)
      time_minPts.append(p[1])
      time_clusters.append(len(np.unique(time_labels)))
      time_sil_score.append(metrics.silhouette_score(df_time_minmax,time_labels)) if len(np.unique(time_labels)) > 1 else "Null"
      labels.append(time_labels)

  params = list(zip(time_clusters, time_sil_score, time_eps, time_minPts, ))
  params_df = pd.DataFrame(params, columns=['clusters', 'silhouette_score', 'eps', 'min_pts'])

  # FIND OPTIMAL CLUSTER
  filter_df = params_df[params_df.silhouette_score == params_df.silhouette_score.max()]
  filter_df2 = filter_df[filter_df.min_pts == filter_df.min_pts.max()]
  filter_df3 = filter_df2[filter_df2.eps == filter_df2.eps.max()]

  index = filter_df3.index[0]
  choosen_eps = filter_df3["eps"].iloc[0]
  choosen_pts = filter_df3["min_pts"].iloc[0]
  choosen_labels = labels[index]
  cluster_result = len(set(choosen_labels)) - (1 if -1 in choosen_labels else 0)
  cluster_noise = list(choosen_labels).count(-1)
  score = time_sil_score[index]


  choosen_params = {
    "eps": choosen_eps,
    "minPts": choosen_pts,
    "cluster": cluster_result,
    "noise": cluster_noise,
    "labels": choosen_labels,
    "silhouette_score": score
  }

  # REMOVE NOISE FROM OUR DATA
  df_db_time = my_df[["lat", "long", "address", "district", "day", "time"]].copy()
  df_db_time["Cluster"] = choosen_labels

  df_db_time = df_db_time.loc[df_db_time["Cluster"] != -1]
  df_db_time["day"] = d_label.inverse_transform(df_db_time["day"])
  df_db_time["time"] = df_db_time["time"].map(lambda x: str(x)+":00")

  return visualization(df_db_time, choosen_params)

def visualization(df, params):
  # get location
  city = "Makassar"
  locator = geopy.geocoders.Nominatim(user_agent="MyCoder")
  location = locator.geocode(city)
  location = [location.latitude, location.longitude]

  x, y = "lat", "long"
  color = "Cluster"
  data = df.copy()
  list_colors = ["#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
             for i in range(params['cluster'])]

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
  
  with open(f"{RESULT_DIR}/data.json", 'w') as my_file:
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
  map_.save(f"{RESULT_DIR}/map.html")
  return "done"

data_mining_process("data_1627039630.071007.csv")