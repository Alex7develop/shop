/**
 * Возвращает Идентификатор (main_offer_id), основываясь на цвете 
 * ID родителя размере и секции
 * 
 * @param {article} - PARENT_ID (Родительский продукт)
 * @param {color} - black or white
 * @param {sectionName} - merch or accessories
 * @param {size} - Любая строка (Например XS, S, MD, L, XL, XXL)
 */
export default function getMainOfferID({
  article: parentId,
  color,
  sectionName, 
  size,
}) {
  const data = window[sectionName];
  console.log(sectionName);
  console.log(data);

  if (data === undefined) return null;

  color = color === 'black'
    ? '000000'
    : color === 'white'
      ? 'ffffff'
      : ''
  
  const { OFFERS: offers } = data[parentId];

  if (sectionName === 'accessories') return offers[0].ID;

  const found = offers.find(offer => {
    if (
      offer.PROPERTY_COLOR_REF_VALUE === color &&
      offer.PROPERTY_SIZE_VALUE === size
    ) return offer;
  });
  const id = found.ID;
  return id;

  // console.log('%cFound ID:', 'color: orange; font-size: 20px;');
  // console.log(id);

  // console.log('%cChoice:', 'color: blue; font-size: 20px;');

  // console.log('parentId:', parentId);
  // console.log('color:', color);
  // console.log('sectionName:', sectionName);
  // console.log('size:', size);

  // console.log('%cwindow[sectionName]:', 'color: dodgerblue; font-size: 20px;');
  // console.log(data);



}