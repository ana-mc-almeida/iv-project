import pandas as pd
import re
import numpy as np


# import dataset
df = pd.read_csv('./portugal_ads_proprieties.csv')

##### DATA PROCESSING

# keep only records where AdsType is not 'Vacation'
def filter_dataset(df: pd.DataFrame) -> pd.DataFrame:
    return df[df['AdsType'] != 'Vacation']

# drop records with NAs
def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    return df.dropna()

# drop unused columns
def remove_features(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop(["ProprietyType", "Location"], axis=1)

##### SELECTED DATA

# if adsType = rent, update price from mensal to anual
def update_price(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        Price=lambda x : x.apply(lambda y: y['Price'] * 12 if y['AdsType'] == 'Rent' else y['Price'], axis=1)
        )

# add new column "price_per_m2"
def create_price_per_m2(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        PricePerMeter=lambda x : x['Price'] / x['Area']
        )

# information from district and municipality should be in separate columns
def split_location(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        District=lambda x: x['Location'].apply(lambda y: y.split(",")[-1] if "," in y else None),
        Municipality=lambda x: x['Location'].apply(lambda y: y.split(",")[-2] if "," in y else None)
    )

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    return(
        df
        .pipe(update_price) # update price from month to year if AdsType is 'Rent'
        .pipe(create_price_per_m2) # create new column price_per_m2
        .pipe(split_location) # split location into district and municipality
        .pipe(clean_dataset) # clean NaN values
        .pipe(filter_dataset) # remove records where AdsType is 'Vacation'
        .pipe(remove_features) # remove unused columns (ProprietyType, Location)
    )

df = preprocess_data(df)
df.to_csv('./final_dataset.csv', index=False)



