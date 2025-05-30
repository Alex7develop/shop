import { API_URL } from "../utils/constants";

export async function fetchCoffeeData() {
  try {
    // const response = await fetch(`${API_URL}/api/mainpage/coffee`);
    const response = await fetch('https://r18.coffee/api/mainpage/coffee');
    const data = await response.json();
    window.coffeeData = data.OFFERS;
    // console.log('Статус ответа который мы заслужили:', response.status);
    console.log('%cДанные о кофе:', 'color: brown; font-size: 15px;', data);

    const transformedData = Object.values(data.OFFERS).flatMap((offersArray) =>
      offersArray.map((offer) => {
        if (offer.packing === 'Фильтр') {
          offer.packing = 'filter';
        }

        offer.packing = offer.packing.replace(/\s+/g, '-');

        // delete offer.system_id;

        const transformedOffer = {
          packing: offer.packing,
          'filter-name': offer['filter-name'],
          id: offer.id,
          part: offer.part,
          title: offer.title,
          taste: offer.taste,
          region: offer.region,
          height: offer.height,
          sort: offer.sort,
          processing: offer.processing,
          q: offer.q,
          roasting: offer.roasting,
          harvest: offer.harvest,
          weight: offer.weight,
          img: offer.img,
          link: '#',
          description: `Кофе R18: '${offer.title}'`,
          // pomol:offer.pomol,
          main_offer_id: offer.main_offer_id,
          system_id: offer.system_id,
          price: offer.price
        };

        // if (offer.packing === 'filter') {
        //   transformedOffer.pomol = offer.pomol;
        // }

        // if (offer.packing === 'Дрип-пакет' && offer.main_offer_id) {
        //   transformedOffer.main_offer_id = offer.main_offer_id;
        // }

        return transformedOffer;
        
      })
      
    );
    console.log('Готовые данные с ценами:========', transformedData);

    // console.log('Вот тут готовый вариант ======>', transformedData);

    return transformedData;
  } catch (error) {
    console.error('Ошибочка:', error);
  }
}
