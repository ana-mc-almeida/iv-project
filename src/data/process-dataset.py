import pandas as pd
import numpy as np

initial_dataset_path = 'initial_dataset.csv'
final_dataset_path = 'final_dataset.csv'

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

# Remove PricePerSquareMeter outliers
def remove_PricePerSquareMeter_outliers(df: pd.DataFrame) -> pd.DataFrame:
    return df[(np.abs(df.PricePerSquareMeter - df.PricePerSquareMeter.mean()) <= (3 * df.PricePerSquareMeter.std()))]

# Remove price outliers
def remove_price_outliers(df: pd.DataFrame) -> pd.DataFrame:
    return df[(np.abs(df.Price - df.Price.mean()) <= (3 * df.Price.std()))]

# Remove area outliers
def remove_area_outliers(df: pd.DataFrame) -> pd.DataFrame:
    return df[(np.abs(df.Area - df.Area.mean()) <= (3 * df.Area.std()))]

def drop_rows_with_non_numeric_rooms(df: pd.DataFrame) -> pd.DataFrame:
    df['Rooms'] = pd.to_numeric(df['Rooms'], errors='coerce')
    return df.dropna(subset=['Rooms'])

# Add id column
def add_id_column(df: pd.DataFrame) -> pd.DataFrame:
    # FIXME Index is not a good id
    return df.assign(
        id=lambda x: x.index
    )

# Slice data to keep only 1000 random records
def slice_data(df: pd.DataFrame) -> pd.DataFrame:
    return df.sample(100)

# Remove area greater than 30k
def remove_area_biggers(df: pd.DataFrame) -> pd.DataFrame:
    return df[df['Area'] <= 30000]

# Main function for data preprocessing
def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df
        .pipe(drop_rows_with_non_numeric_rooms)
        .pipe(convert_rent_price_to_annual)
        .pipe(calculate_price_per_square_meter)
        .pipe(split_location_into_columns)
        .pipe(remove_missing_values)
        .pipe(remove_area_biggers)
        .pipe(filter_non_vacation_ads)
        .pipe(drop_unused_columns)
        .pipe(remove_PricePerSquareMeter_outliers)
        .pipe(remove_price_outliers)
        .pipe(remove_area_outliers)
        .pipe(add_id_column)
        .pipe(slice_data)
    )

df_processed = preprocess_data(df)
df_processed.to_csv(final_dataset_path, index=False)
df_processed.to_json('final_dataset.json', index=False, orient="records")
