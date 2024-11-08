import pandas as pd
import numpy as np
import json

zones = {
    'Norte': ['Porto', 'Braga', 'Viana do Castelo', 'Vila Real', 'Bragança'],
    'Centro': ['Aveiro', 'Viseu', 'Guarda', 'Coimbra', 'Castelo Branco', 'Leiria', 'Santarém', 'Lisboa', 'Portalegre'],
    'Sul': ['Setúbal', 'Évora', 'Beja', 'Faro'],
}

initial_dataset_path = 'initial_dataset.csv'
initial_geoData_path = 'initial_portugal_district.geojson'

# Import dataset
df_dataSet = pd.read_csv(initial_dataset_path) 

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
        PricePerSquareMeter=lambda x: (x['Price'] / x['Area']).round(1)
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
    district_to_zone = {district: zone for zone, districts in zones.items() for district in districts}
    return df.assign(Zone=lambda x: x['District'].apply(lambda y: district_to_zone.get(y, 'aaaaaaa')))

# Remove area greater than 30k
def remove_area_biggers(df: pd.DataFrame) -> pd.DataFrame:
    return df[df['Area'] <= 30000]

# Remove price outliers when AdsType is 'Rent'
def remove_rent_price_outliers(df: pd.DataFrame) -> pd.DataFrame:
    # Filtra apenas os registros onde AdsType é 'Rent'
    rent_df = df[df['AdsType'] == 'Rent']
    
    # Calcula a média e o desvio padrão dos preços de aluguel
    mean_price = rent_df['Price'].mean()
    std_price = rent_df['Price'].std()
    
    # Remove os outliers
    filtered_rent_df = rent_df[np.abs(rent_df['Price'] - mean_price) <= (3 * std_price)]
    
    # Combina os dados filtrados de aluguel com os outros tipos de anúncios
    return pd.concat([filtered_rent_df, df[df['AdsType'] != 'Rent']])

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
        .pipe(remove_rent_price_outliers)
        .pipe(remove_area_outliers)
        .pipe(remove_area_outliers)
        .pipe(add_id_column)
        .pipe(remove_islands)
        .pipe(remove_under_construction)
        .pipe(create_zone_column)
        # .pipe(slice_data)
    )

df_dataset_processed = preprocess_data(df_dataSet)
df_dataset_processed.to_csv('final_dataset.csv', index=False)
df_dataset_processed.to_json('final_dataset.json', index=False, orient="records")


def count_districts(df: pd.DataFrame) -> pd.Series:
    return df['District'].value_counts()

def mean_area_by_district(df: pd.DataFrame) -> pd.Series:
    return df.groupby('District')['Area'].mean()

def mean_pricePerSquareMeter_by_district(df: pd.DataFrame) -> pd.Series:
    return df.groupby('District')['PricePerSquareMeter'].mean()

def format_district_name(district: str) -> str:
    return district.title()

# Function for processing GeoJSON data
def process_geoData(geojson_path: str, district_counts: pd.Series, 
                    mean_area: pd.Series, mean_pricePerSquareMeter: pd.Series) -> dict:
    with open(geojson_path) as f:
        geojson_data = json.load(f)
    
    district_to_zone = {district: zone for zone, districts in zones.items() for district in districts}
    
    # Calcular os quartis
    countQuartiles = pd.qcut(district_counts, q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])
    areaQuartiles = pd.qcut(mean_area, q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])
    priceQuartiles = pd.qcut(mean_pricePerSquareMeter, q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])

    # Definindo os percentis desejados manualmente
    percentiles = [0.25, 0.5, 0.75, 1.0]

    # Calculando os limites com os percentis especificados
    _, district_bins = pd.qcut(district_counts, q=percentiles, retbins=True)
    _, area_bins = pd.qcut(mean_area, q=percentiles, retbins=True)
    _, price_bins = pd.qcut(mean_pricePerSquareMeter, q=percentiles, retbins=True)

    # Criar um DataFrame com os valores concretos dos quartis
    quartiles_df = pd.DataFrame({
        'District Count Limits': [district_bins[0], district_bins[1], district_bins[2], district_bins[3]],
        'Area Limits': [area_bins[0], area_bins[1], area_bins[2], area_bins[3]],
        'Price Per Sq Meter Limits': [price_bins[0], price_bins[1], price_bins[2], price_bins[3]]
    })

    quartiles_list = [{
        "District Count Limits": [round(value, 1) for value in quartiles_df["District Count Limits"]],
        "Area Limits": [round(value, 1) for value in quartiles_df["Area Limits"]],
        "Price Per Sq Meter Limits": [round(value, 1) for value in quartiles_df["Price Per Sq Meter Limits"]]
    }]

    # Salvar como JSON
    with open('quartiles_values.json', 'w') as f:
        json.dump(quartiles_list, f, indent=4)


    # Criar um DataFrame para armazenar as contagens e quartis
    countQuartile_df = pd.DataFrame({'Count': district_counts, 'Quartile': countQuartiles})
    areaQuartiles_df = pd.DataFrame({'AreaQuartile': mean_area, 'Quartile': areaQuartiles})
    priceQuartiles_df = pd.DataFrame({'AreaQuartile': mean_pricePerSquareMeter, 'Quartile': priceQuartiles})

    for feature in geojson_data['features']:
        # Get the original district name
        district = feature['properties'].get('Distrito')
        
        if not district:
            continue  # Skip if 'Distrito' is not present

        # Format district name
        formatted_district = "Viana do Castelo" if district.upper() == "VIANA DO CASTELO" else district.title()

        feature['properties']['Zone'] = district_to_zone.get(formatted_district, 'Zona Desconhecida')
        feature['properties']['District'] = formatted_district
        del feature['properties']['Distrito']

        feature['properties']['Count'] = int(district_counts.get(formatted_district, 0))
        quartile = countQuartile_df.loc[formatted_district, 'Quartile'] if formatted_district in countQuartile_df.index else 'Unknown'
        feature['properties']['NumberOfAvailabilityQuartile'] = quartile

        feature['properties']['AreaMean'] = float(mean_area.get(formatted_district, 0))
        quartile = areaQuartiles_df.loc[formatted_district, 'Quartile'] if formatted_district in areaQuartiles_df.index else 'Unknown'
        feature['properties']['AreaQuartile'] = quartile

        feature['properties']['PriceMean'] = float(mean_pricePerSquareMeter.get(formatted_district, 0))
        quartile = priceQuartiles_df.loc[formatted_district, 'Quartile'] if formatted_district in priceQuartiles_df.index else 'Unknown'
        feature['properties']['PriceQuartile'] = quartile
        
    return geojson_data

# Process the GeoJSON data and save the output
district_counts = count_districts(df_dataset_processed)
mean_area = mean_area_by_district(df_dataset_processed)
mean_pricePerSquareMeter = mean_pricePerSquareMeter_by_district(df_dataset_processed)

df_geoData_processed = process_geoData(initial_geoData_path, district_counts, mean_area, mean_pricePerSquareMeter)
with open('final_portugal_district.geojson', 'w', encoding='utf-8') as f:
    json.dump(df_geoData_processed, f, ensure_ascii=False, indent=4)