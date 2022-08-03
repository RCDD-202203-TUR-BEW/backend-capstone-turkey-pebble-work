const CITIES = [
    'Adana',
    'Kocaeli',
    'Adiyaman',
    'Konya',
    'Afyonkarahisar',
    'Kutahya',
    'Agri',
    'Malatya',
    'Amasya',
    'Manisa',
    'Ankara',
    'Kahramanmaras',
    'Antalya',
    'Mardin',
    'Artviin',
    'Mugla',
    'Aydin',
    'Mus',
    'Balikesir',
    'Nevsehir',
    'Bilecik',
    'Nigde',
    'Bingol',
    'Ordu',
    'Bitlis',
    'Rize',
    'Bolu',
    'Sakarya',
    'Burdur',
    'Samsun',
    'Bursa',
    'Siirt',
    'Canakkale',
    'Sinop',
    'Cankiri',
    'Sivas',
    'Corum',
    'Tekirdag',
    'Denizli',
    'Tokat',
    'Diyarbakir',
    'Trabzon',
    'Edirne',
    'Tunceli',
    'Elazig',
    'Sanliurfa',
    'Erzincan',
    'Usak',
    'Erzurum',
    'Van',
    'Eskisehir',
    'Yozgat',
    'Gaziantep',
    'Zonguldak',
    'Giresun',
    'Aksaray',
    'Gumushane',
    'Bayburt',
    'Hakkari',
    'Karaman',
    'Hatay',
    'Kirikkale',
    'Isparta',
    'Batman',
    'Mersin',
    'Sirnak',
    'Istanbul',
    'Bartin',
    'Izmir',
    'Ardahan',
    'Kars',
    'Igdir',
    'Kastamonu',
    'Yalova',
    'Kayseri',
    'Karabuk',
    'Kirklareli',
    'Kilis',
    'Kirsehir',
    'Osmaniye',
    'Duzce',
];
const CATEGORIES = [
    'No Poverty',
    'Zero Hunger',
    'Good Health And Well-Being',
    'Quality Education',
    'Gender Equality',
    'Clean Water And Sanitation',
    'Affordable And Clean Energy',
    'Animals',
    'Oceans',
    'Nature',
    'Reduced Inequalities',
    'Sustainable Cities And Communities',
    'Responsible Consumption And Production',
    'Climate Action',
    'Life Below Water',
    'Life On Land',
    'Peace',
    'Youth',
    'Justice',
];

const MAX_IMAGE_SIZE = 1024 * 1024 * 10; // 10MB
const HASH_ROUNDS = 10;
const FOURTEEN_DAYS_MILLISECONDS = 1000 * 60 * 60 * 24 * 14; // 14 days
const FOURTEEN_DAYS_STRING = '14d'; // 14 days
const PROFILE_IMAGE_DIR = 'profileImages';
const COVER_IMAGE_DIR = 'coverImages';
const EMAIL_VERIFY_SUBJECT = 'Verify your email';

const SWAGGER_OPTIONS = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PebbleWork API documentation with Swagger',
            version: '0.1.0',
            description: 'This is a API application made with Express',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'PebbleWork',
                url: 'https://github.com/RCDD-202203-TUR-BEW/backend-capstone-turkey-pebble-work',
                email: process.env.EMAIL,
            },
        },
        servers: [
            {
                url: process.env.BASE_URL,
            },
        ],
        host: process.env.BASE_URL,
    },
    apis: ['./src/docs/**/*.yaml'],
};

module.exports = {
    CITIES,
    CATEGORIES,
    MAX_IMAGE_SIZE,
    HASH_ROUNDS,
    FOURTEEN_DAYS_MILLISECONDS,
    FOURTEEN_DAYS_STRING,
    PROFILE_IMAGE_DIR,
    COVER_IMAGE_DIR,
    EMAIL_VERIFY_SUBJECT,
    SWAGGER_OPTIONS,
};
