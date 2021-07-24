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

  time_clustering = time_db_clustering(my_df)
  cl_result = json.loads(time_clustering)

  # REMOVE NOISE FROM OUR DATA
  # df_db_time = my_df[["lat", "long", "address", "district", "day", "time"]].copy()
  # df_db_time["Cluster"] = cl_result.labels

  # df_db_time = df_db_time.loc[df_db_time["Cluster"] != -1]
  # df_db_time["day"] = d_label.inverse_transform(df_db_time["day"])
  # df_db_time["time"] = df_db_time["time"].map(lambda x: str(x)+":00")

  print(str(type(cl_result)))
  # print(str(df_db_time.head()))
  # return 

def time_db_clustering(my_df):

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


  res = {
    "eps": choosen_eps,
    "minPts": choosen_pts,
    "cluster": cluster_result,
    "noise": cluster_noise,
    "labels": choosen_labels,
    "silhouette_score": score
  }

  return res
data_mining_process("data_1627039630.071007.csv")