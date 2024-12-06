const transformAccessoriesData = (data) => {
  return Object.values(data).map((item) => {
    const uniqueOffers = {};
    const offers = item.OFFERS;

    for (const offer of offers) {
      if (!uniqueOffers[offer.ID]) {
        uniqueOffers[offer.ID] = offer;
      }
    }

    const uniqueOffersArray = Object.values(uniqueOffers);
    const colors = ['black'];

    const transformedItem = {
      article: item.ID,
      title: item.NAME,
      colors: colors.map(() => ({
        name: '',
        value: '',
      })),
      price: `${parseInt(uniqueOffersArray[0]?.PRICE, 10)} р.`,
      composition: uniqueOffersArray
        .map((offer) => offer.PREVIEW_TEXT)
        .filter((v, i, a) => a.indexOf(v) === i),
      link: '#',
      description: `${item.NAME} ${
        uniqueOffersArray[0]?.PROPERTY_SIZE_VALUE || ''
      }`,
    };

    colors.forEach((color) => {
      transformedItem[color] = {
        img: uniqueOffersArray
          .flatMap((offer) => offer.PROPERTY_PICTURES_VALUE_SRC)
          .slice(0, 1),
        sizes: uniqueOffersArray
          .map((offer) => offer.PROPERTY_SIZE_VALUE)
          .filter((size, index, self) => self.indexOf(size) === index),
      };
    });

    return transformedItem;
  });
};

export const fetchAccessoriesData = async () => {
  try {
    const response = await fetch(
      'https://dev.r18.coffee/api/mainpage/accessories'
    );

    console.log('Статус ответа', response.status);

    if (!response.ok) {
      throw new Error('Ошибка при загрузке данных');
    }

    const data = await response.json();
    return transformAccessoriesData(data);
  } catch (error) {
    console.error('Что-то пошло не так', error);
    return null;
  }
};


