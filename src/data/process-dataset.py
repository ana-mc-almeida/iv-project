import pandas as pd
import numpy as np

initial_dataset_path = './initial_dataset.csv'
final_dataset_path = './final_dataset.csv'

# Import dataset
df = pd.read_csv(initial_dataset_path)

##### DATA PROCESSING FUNCTIONS #####

# Filter records to keep only those that are not of type 'Vacation'
def filter_non_vacation_ads(df: pd.DataFrame) -> pd.DataFrame:
    return df[df['AdsType'] != 'Vacation']

# Remove missing values (NaN)
def remove_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    return df.dropna()

# Remove unused columns
def drop_unused_columns(df: pd.DataFrame) -> pd.DataFrame:
    columns_to_drop = ["ProprietyType", "Location"]
    return df.drop(columns=columns_to_drop, axis=1)

##### DATA TRANSFORMATION FUNCTIONS #####

# Update the price of rental ads ('Rent') from monthly to annual
def convert_rent_price_to_annual(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        Price=lambda x: x.apply(lambda y: y['Price'] * 12 if y['AdsType'] == 'Rent' else y['Price'], axis=1)
    )

# Create a new column with the price per square meter
def calculate_price_per_square_meter(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        PricePerSquareMeter=lambda x: x['Price'] / x['Area']
    )

# Slice the location string to extract the district and municipality
def split_location_into_columns(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(
        District=lambda x: x['Location'].apply(lambda y: y.split(",")[-1] if "," in y else None),
        Municipality=lambda x: x['Location'].apply(lambda y: y.split(",")[-2] if "," in y else None)
    )


# Main function for data preprocessing
def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df
        .pipe(convert_rent_price_to_annual)
        .pipe(calculate_price_per_square_meter)
        .pipe(split_location_into_columns)
        .pipe(remove_missing_values)
        .pipe(filter_non_vacation_ads)
        .pipe(drop_unused_columns)
    )

df_processed = preprocess_data(df)
df_processed.to_csv(final_dataset_path, index=False)
