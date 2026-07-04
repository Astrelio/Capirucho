export interface Dish {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
}

const IMG_HERO =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAADo0thPmFSgo2cs-rbEedL_JSyQsz4bhcDURgMs6bJGFjRoLm6LWfF5wSI0aBet9DtfiWxMmj8JtSp-H5LCeyCDMGZe22VGf5XNdwgxBeYTVnu6G34ruVS4516it6yUcIy7SMTpnnp8mAxPXSgsv7-v4MaquOHnrj5y7-7GZK5r8cSujIKyzUjcIYjOBlycYpOb5sCR3_IPJ1dKAFkdqvG7AnUk4HBf1jfCQLJrOtGRvs4jpSAX7cwbq6plpoB7_rLi2s_xe_A8E';
const IMG_COSTILLA =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDCyazzAfwBAjo0dJ4n0PYjjUD2FszQFsPvj-n9EqhGdOEaBYdShDIfbxA4IZ60WIH9qxkIC52r-02qt0r10GOCBIL6AjJLqMsRyZ1xdKGZb0XorxhtxotuEnwBiwBQ3cH_i5ikcp5u0kHDOqa_8w5rO4-wfvXq8H8HPBqNu5QV_7KSeEXjI0pjHrb1MV9Rk0OnRRGsZxE2etNqNijrhmojv9rAb2xP9QSXtbzjTUZSWvGm2E_63BvQ0ly83hDIgW8ZlI74b2S3orE';
const IMG_CEVICHE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCZbThG4zDsMoaM_MMPbcodtvGtvgzTVFiuxmPmzMtDCifM2ZrZQviI2Rd-Dsf5TO0Q196wHDkQzPEFhpb1o7gAT_e9KhS4p7D-s49hnDUmn34ifVbCFObzOSfnbDJY4dJeiwRNdsAeVB1JjvKvZ62wsBZbpvsqD5lMJpWxlHyJMpEPvfKZux1At2QBvRe1NxjlK9oNvEtPEx9cgls15TOZroY9BqVH4enK9ImRBIhCjIwvUZgoUYyU8sn94RAilZleTL7SXjM_4rM';
const IMG_CHOCOLATE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQGTdDpN8s9h6bdK6N9snj8sLPGey-yBNom_qIzsaQGlTKn8IDFXJUZ-_1M_ZC3z8sM98a2EojxpkQS1RSFB7k4swkStF4hGhcnowFAFE92Gaz4Vve9dcyu6LXLKZxUI1XLkzPY47_b_DCfsg2UENPwer_J0CRWncvTED0eWS8HCbod8bhibxgvI2SqtWoE6ft5lFMkd2sMj6V_1i-H0WzZk5mVVZeRC87bMWFgEdyiPI3s02H6e6z4XMEHrfYOSzRW28DJNsjQwQ';

export const dishes: Dish[] = [
  {
    name: 'Costilla Estofada',
    description:
      'Slow-braised beef ribs with rustic herbs, served over creamy maize purée. A masterclass in slow cooking.',
    price: '$28',
    category: 'Plato Fuerte',
    image: IMG_COSTILLA,
  },
  {
    name: 'Ceviche Tradicional',
    description:
      'Fresh catch of the day cured in citrus juices, spiced with aji pepper and sweet potato.',
    price: '$22',
    category: 'Entrada',
    image: IMG_CEVICHE,
  },
  {
    name: 'Volcán de Chocolate',
    description:
      'Warm, molten chocolate cake with a hint of local spice, paired with vanilla bean ice cream.',
    price: '$12',
    category: 'Postre',
    image: IMG_CHOCOLATE,
  },
  {
    name: 'Parrillada de la Casa',
    description:
      'Grilled meats and charred vegetables in a rich, glossy sauce, sizzling in cast iron over open embers.',
    price: '$34',
    category: 'Plato Fuerte',
    image: IMG_HERO,
  },
  {
    name: 'Tiradito de Pescado',
    description:
      'Thin slices of fresh fish bathed in a bright citrus leche de tigre with a delicate chili finish.',
    price: '$20',
    category: 'Entrada',
    image: IMG_CEVICHE,
  },
  {
    name: 'Brasa Ancestral',
    description:
      'Our signature hearth-cooked cut, kissed by fire and served with heritage grains and roasted roots.',
    price: '$30',
    category: 'Plato Fuerte',
    image: IMG_HERO,
  },
];
