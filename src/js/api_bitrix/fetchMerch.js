const colorMapping = {
  '000000': { name: 'black', value: '#3F3937' },
  ffffff: { name: 'white', value: '#ffffff' },
};

const mapColorToName = (color) => {
  return colorMapping[color] || { name: 'unknown', value: '#000000' };
};

const transformData = (data) => {
  return Object.values(data).map((item) => {
    const uniqueOffers = {};
    const offers = item.OFFERS;

    for (const offer of offers) {
      if (!uniqueOffers[offer.ID]) {
        uniqueOffers[offer.ID] = offer;
      }
    }

    const uniqueOffersArray = Object.values(uniqueOffers);

    // Создаем массив цветов, сортируя его так, чтобы черный был первым
    const colors = Array.from(
      new Set(uniqueOffersArray.map((offer) => offer.PROPERTY_COLOR_REF_VALUE))
    ).sort((a, b) => (a === '000000' ? -1 : b === '000000' ? 1 : 0));

    const transformedItem = {
      article: item.ID,
      title: item.NAME,
      colors: colors.map(mapColorToName),
      price: `${parseInt(uniqueOffersArray[0]?.PRICE, 10)} р.`,
      composition: uniqueOffersArray
        .map((offer) => offer.PREVIEW_TEXT)
        .filter((v, i, a) => a.indexOf(v) === i),
      link: 'dev.r18.coffee',
      description: `Добавлен товар:  '${item.NAME}'`,
    };

    colors.forEach((color) => {
      const colorName = mapColorToName(color).name;
      const isSpecialItem = item.ID === '56';

      transformedItem[colorName] = {
        img: uniqueOffersArray
          .filter((offer) => offer.PROPERTY_COLOR_REF_VALUE === color)
          .flatMap((offer) => offer.PROPERTY_PICTURES_VALUE_SRC)
          .slice(0, isSpecialItem ? 3 : 2),
        sizes: uniqueOffersArray
          .filter((offer) => offer.PROPERTY_COLOR_REF_VALUE === color)
          .map((offer) => offer.PROPERTY_SIZE_VALUE)
          .filter((size, index, self) => self.indexOf(size) === index),
      };
    });

    return transformedItem;
  });
};

export const fetchMerchData = async () => {
  try {
    const response = await fetch(
      'https://dev.r18.coffee/api/mainpage/merch'
    );

    console.log('Статус ответа', response.status);

    if (!response.ok) {
      throw new Error('Ошибочка залетела');
    }

    const data = await response.json();
    return transformData(data);
  } catch (error) {
    console.error('Что-то не так', error);
    return null;
  }
};
