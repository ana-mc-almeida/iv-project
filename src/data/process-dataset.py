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
        District=lambda x: x['Location'].apply(lambda y: y.split(",")[-1].strip() if "," in y else None),  # Remove espaços
        Municipality=lambda x: x['Location'].apply(lambda y: y.split(",")[-2].strip() if "," in y else None)  # Remove espaços
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

# Rooms that had values "10 or more" were deleted
def drop_rows_with_non_numeric_rooms(df: pd.DataFrame) -> pd.DataFrame:
    df['Rooms'] = pd.to_numeric(df['Rooms'], errors='coerce')
    return df.dropna(subset=['Rooms'])

# Remove records that are not in the principal cities
def remove_non_principal_cities(df: pd.DataFrame) -> pd.DataFrame:
    # Is principal city if location.slipt(",").length == 2
    return df[df['Location'].apply(lambda x: len(x.split(",")) == 2)]

# Add id column
def add_id_column(df: pd.DataFrame) -> pd.DataFrame:
    # FIXME Index is not a good id
    return df.assign(
        id=lambda x: x.index
    )

# Slice data to keep only 1000 random records
def slice_data(df: pd.DataFrame) -> pd.DataFrame:
    return df.sample(2000)

# Remove condition different from 'Used', 'New' or 'Renovated'
def remove_under_construction(df: pd.DataFrame) -> pd.DataFrame:
    return df[df['Condition'].isin(['Used', 'New', 'Renovated'])]

# Remove islands
def remove_islands(df: pd.DataFrame) -> pd.DataFrame:
    return df[~df['District'].str.contains('Ilha')]

# Create nem column 'Zone' based on the 'District' column
def create_zone_column(df: pd.DataFrame) -> pd.DataFrame:
    zones = {
        'Norte': ['Porto', 'Braga', 'Viana do Castelo', 'Vila Real', 'Bragança'],
        'Centro': ['Aveiro', 'Viseu', 'Guarda', 'Coimbra', 'Castelo Branco', 'Leiria', 'Santarém', 'Lisboa'],
        'Alentejo': ['Setúbal', 'Évora', 'Portalegre', 'Beja', 'Faro'],
    }
    district_to_zone = {district: zone for zone, districts in zones.items() for district in districts}
    return df.assign(Zone=lambda x: x['District'].apply(lambda y: district_to_zone.get(y, 'aaaaaaa')))
    return df.sample(100)

# Remove area greater than 30k
def remove_area_biggers(df: pd.DataFrame) -> pd.DataFrame:
    return df[df['Area'] <= 30000]

def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    return (
        df
        .pipe(drop_rows_with_non_numeric_rooms)
        .pipe(convert_rent_price_to_annual)
        .pipe(calculate_price_per_square_meter)
        .pipe(remove_non_principal_cities)
        .pipe(split_location_into_columns)
        .pipe(remove_missing_values)
        .pipe(remove_area_biggers)
        .pipe(filter_non_vacation_ads)
        .pipe(drop_unused_columns)
        .pipe(remove_PricePerSquareMeter_outliers)
        .pipe(remove_price_outliers)
        .pipe(remove_area_outliers)
        .pipe(remove_area_outliers)
        .pipe(add_id_column)
        .pipe(remove_islands)
        .pipe(remove_under_construction)
        .pipe(create_zone_column)
        # .pipe(slice_data)
    )

df_processed = preprocess_data(df)
df_processed.to_csv(final_dataset_path, index=False)
df_processed.to_json('final_dataset.json', index=False, orient="records")
