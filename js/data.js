// Mock Data for Asocial App

const MOCK_USERS = [
    { id: 1, username: 'me', avatar: 'me', bio: 'testing...' },
    { id: 2, username: 'enrico', avatar: 'enrico', bio: 'bah.' },
    { id: 3, username: 'ciolo', avatar: 'ciolo', bio: 'lavoro fino a tardi' },
    { id: 4, username: 'sabri', avatar: 'sabri', bio: 'mi piacciono i topi' },
    { id: 6, username: 'riccardo', avatar: 'ric', bio: '🏓' },
    { id: 5, username: 'ila', avatar: 'ila', bio: 'mando avanti la baracca' }
];

const MOCK_POSTS = [
    {
        id: 1,
        userId: 5,
        content: 'eccomi!',
        image: null,
        timestamp: new Date('2025-12-23T19:45:00'),
        comments: []
    },
    {
        id: 2,
        userId: 3,
        content: 'bus-i',
        image: 'images/bus_stop_view_1766517622375.png',
        timestamp: new Date('2025-12-23T18:30:00'),
        comments: [
            { id: 1, userId: 2, text: 'ahahahahahahahah', timestamp: new Date('2025-12-23T18:35:00') }
        ]
    },
    {
        id: 3,
        userId: 4,
        content: 'faccio la lavatrice',
        image: 'images/laundry_pile_1766517606744.png',
        timestamp: new Date('2025-12-23T17:15:00'),
        comments: []
    },
    {
        id: 4,
        userId: 4,
        content: 'caffè fatto da richi',
        image: 'images/coffee_mug_1766517592651.png',
        timestamp: new Date('2025-12-23T16:20:00'),
        comments: [
            { id: 2, userId: 5, text: 'buono', timestamp: new Date('2025-12-23T16:25:00') },
            { id: 3, userId: 1, text: 'trombetta', timestamp: new Date('2025-12-23T16:30:00') }
        ]
    },
    {
        id: 6,
        userId: 6,
        content: 'my plant watching me playing 🏓',
        image: 'images/houseplant_plain_1766517651857.png',
        timestamp: new Date('2025-12-23T14:00:00'),
        comments: [
            { id: 5, userId: 5, text: 'stai tento', timestamp: new Date('2025-12-23T14:15:00') }
        ]
    }
];

// Current user (simulated authentication)
const CURRENT_USER = MOCK_USERS[0];

// Export for use in app
window.MOCK_DATA = {
    users: MOCK_USERS,
    posts: MOCK_POSTS,
    currentUser: CURRENT_USER
};
