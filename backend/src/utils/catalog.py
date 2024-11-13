# util functions to fix and prepare catalog
from datetime import datetime
from time import sleep
import pandas as pd
import requests
import re
import os


def read_catalog_from_xlsx(products_catalog_path):
    '''
        Inputs:
            products_catalog_path: e.g. '../data/productsV2024-04-14.xlsx'
        Returns dataframe
    '''
    dtype_dict = {
        'productCode': str,
        'stock': float,
        'price': float,
    }
    products = pd.read_excel(products_catalog_path,dtype=dtype_dict, thousands=',')
    products['productCode'] = products['productCode'].str.zfill(11)
    products = products.sort_values(by='productCode', ascending=True)
    products = products.drop_duplicates(subset=['productCode'], keep='first')
    # stripping spaces
    products = products.applymap(lambda x: x.strip() if isinstance(x, str) else x)
    return products


def clear_sections(products):
    products['section'] = products['section'].str.strip().str.lower()
    category_replacements = {
        'терапия': 'Терапия',
        'разное': 'Разное',
        'raznoe': 'Разное',
        'оборудование и приборы для стоматологии':'Стоматологические инструменты',
        'instrumenty': 'Стоматологические инструменты',
        'materials': 'Материалы',
        'детская стомотология':'Детская стоматология',
        'наконечник': 'Стоматологические Наконечники И Микромоторы',
        'оборудование': 'Медицинское Оборудование',
        'Оборудование': 'Медицинское Оборудование',
        'Оборудования': 'Медицинское Оборудование',
        'дезинфицирующие средства': 'Стерилизация И Дезинфекция',
        'ортодантия':'Ортодонтия',
        'newitems': 'Новые товары',
        'стоматологическое оборудование и приборы для стоматологии':'Стоматологические Оборудования И Приборы',
        'эндодонтия':'Эндодонтия',
        'полировочные системы ':'Полировочные Системы',
        'полирующие системы':'Полировочные Системы',
    }

    products['section'] = products['section'].replace(category_replacements)
    products['section'] = products['section'].str.replace('\xa0', ' ', regex=True).str.strip()
    products['section'] = products['section'].fillna('Другие')
    products['section'] = products['section'].str.capitalize()
    return products


def clear_subcategory(products):
    subcategory_replacements = {
        'терапия': 'Терапия',
        'разное': 'Разное',
        'raznoe': 'Разное',
        'instrumenty': 'Инструменты',
        'materials': 'Материалы',
        'эндодонтия\xa0': 'Эндодонтия', # Removing non-breaking space
        'аппликаторы': 'Аппликаторы',
        'полиры': 'Полир',
        'полировачные щетки': 'Полирующие Щетки',
        'другое': 'Разное',
        'пылесосы': 'Слюноотсосы И Пылесосы',
        'ватные валики и шарики, драй типсыва': 'Ватные Валики И Шарики',
        'ретракция десны': 'Ретракция Десны',
        'оборудование': 'Оборудование',
        'цемент': 'Цементы',
        'апликационная анестезия': 'Анестезия',
        'апекслокаторы': 'Апекслокаторы',
        'пломбтровочные материалы': 'Пломбировочные Материалы',
        'терапия ,эндодонтия': 'Терапия И Эндодонтия',
        'гигиена и отбеливание': 'Гигиена И Отбеливание',
        'адгезивы': 'Адгезивы',
        'наконечники': 'Стоматологические Наконечники И Микромоторы',
        'newitems': 'Новые Товары',
        'обработка каналов':'Обработка Каналов И Периапикальных Тканей',
        'одноразовое о стерильное белье':'Одноразовое И Стерильное Белье',
        'ретракторы и роторасшилители':'Ретракторы И Роторасширители',
        'система роббердам (коффердам)':'Система Раббердам (Коффердам)',
        'средства для проверки артикуляции и оклюзии':'Средства Для Проверки Артикуляции И Окклюзии',
    }

    products['category'] = products['category'].str.strip().str.lower()
    products['category'] = products['category'].replace(subcategory_replacements)
    products['category'] = products['category'].fillna('Others')
    products['category'] = products['category'].str.capitalize()
    def clean_subcategory(subcategory):
        return subcategory.strip().replace('\xa0', '')

    products['category'] = products['category'].apply(clean_subcategory)
    products['category'] = products['category'].apply(lambda x: 'Другое' if x == 'Others' else x)
    return products


def clear_countries(products):
    country_mapping = {
        'Пакестан':'Пакистан',
        'Белорусь':'Беларусь',
        'США':'США',
        'CША':'США',
        'Швецария':'Швейцария',
        'сша':'США',
        'Польша-Италия.':'Польша-Италия',
        'германия':'Германия', 
        'россия':'Россия'
    }

    # Apply the mappings
    for old, new in country_mapping.items():
        products['country'] = products['country'].replace(old, new)
    return products

def clear_metrics(products):
    metric_mapping = {
        'Шт.':'шт',
        'Упак.':'упак',
        'Баллончик':'баллончик',
        'Набор':'набор',
        'Рулон':'рулон',
        'флак':'флакон',
        'Флакон':'флакон',
    }
    for old, new in metric_mapping.items():
        products['measureUnit'] = products['measureUnit'].replace(old, new)
    return products

def save_catalog_into_new_files(products):
    todays_date = datetime.now().strftime('%Y-%m-%d')
    products.to_excel(f'../docs/productsV{todays_date}reviewed.xlsx', index=False)
    products.to_csv(f'../docs/productsV{todays_date}.csv', index=False)
    print("Saved.")
    return True

