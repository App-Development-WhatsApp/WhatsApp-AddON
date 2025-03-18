export const Menu = [
    {
        id: Math.random().toString(12).substring(2),
        title: 'Chats',
        icon: require('../assets/icons/chats-filled.png'),
    },
    {
        id: Math.random().toString(12).substring(2),
        title: 'Updates',
        icon: require('../assets/icons/updates.png'),
    },
    {
        id: Math.random().toString(12).substring(2),
        title: 'Communities',
        icon: require('../assets/icons/com.png'),
    },
    {
        id: Math.random().toString(12).substring(2),
        title: 'Calls',
        icon: require('../assets/icons/calls.png'),
    },
]

export const ChannelFollowed = [
    {
        id: Math.random().toString(12).substring(2),
        name: 'Computer Science',
        image: require('../assets/images/blank.jpeg'),
        datetime: '06/05/2024',
        message: 'Join me live for todays teaching on...'
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'EEE',
        image: require('../assets/images/blank.jpeg'),
        datetime: '03/05/2024',
        message: 'Atlanta this weekend!',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'ECE',
        image: require('../assets/images/blank.jpeg'),
        datetime: '01/05/2024',
        message: 'Anyone else watching this weekend?',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'ML',
        image: require('../assets/images/blank.jpeg'),
        datetime: '29/04/2024',
        message: 'I just dropped a new playlist on python...',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'AI',
        image: require('../assets/images/blank.jpeg'),
        datetime: '27/10/2023',
        message: 'https://fb.watch/nWT73talRA/?mibextid=onwyNj',
    },
]

export const ChannelData = [
    {
        id: Math.random().toString(12).substring(2),
        name: 'OS',
        image: require('../assets/images/blank.jpeg'),
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'OOPS',
        image: require('../assets/images/blank.jpeg'),
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'SP',
        image: require('../assets/images/blank.jpeg'),
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Civil',
        image: require('../assets/images/blank.jpeg'),
    },
]

export const CallHistory = [
    {
        "id": "a1b2c3d4",
        "UserId": "user-101",
        "name": "Samuel",
        "image": require('../assets/images/samuel.jpg'),
        "type": "call",
        "datetime": [
            { "date": "10/03/2025", "time": "22:05:00", "status": "incoming" }
        ],
        "missed": true
    },
    {
        "id": "e5f6g7h8",
        "UserId": "user-101",
        "name": "Samuel",
        "image": require('../assets/images/samuel.jpg'),
        "type": "video",
        "datetime": [
            { "date": "11/03/2025", "time": "15:30:00", "status": "outgoing" }
        ],
        "missed": false
    },
    {
        "id": "i9j1k2l3",
        "UserId": "user-102",
        "name": "Emma",
        "image": require('../assets/images/blank.jpeg'),
        "type": "call",
        "datetime": [
            { "date": "10/03/2025", "time": "18:45:00", "status": "incoming" }
        ],
        "missed": false
    },
    {
        "id": "m4n5o6p7",
        "UserId": "user-103",
        "name": "John",
        "image": require('../assets/images/blank.jpeg'),
        "type": "video",
        "datetime": [
            { "date": "12/03/2025", "time": "08:15:00", "status": "incoming" }
        ],
        "missed": false
    },
    {
        "id": "q8r9s1t2",
        "UserId": "user-104",
        "name": "Alice",
        "image": require('../assets/images/blank.jpeg'),
        "type": "call",
        "datetime": [
            { "date": "09/03/2025", "time": "23:30:00", "status": "incoming" }
        ],
        "missed": false
    },
    {
        "id": "u3v4w5x6",
        "UserId": "user-102",
        "name": "Emma",
        "image": require('../assets/images/blank.jpeg'),
        "type": "video",
        "datetime": [
            { "date": "11/03/2025", "time": "20:50:00", "status": "outgoing" }
        ],
        "missed": false
    },
    {
        "id": "y7z8a9b1",
        "UserId": "user-105",
        "name": "Michael",
        "image": require('../assets/images/blank.jpeg'),
        "type": "call",
        "datetime": [
            { "date": "08/03/2025", "time": "14:10:00", "status": "incoming" }
        ],
        "missed": false
    },
    {
        "id": "c2d3e4f5",
        "UserId": "user-106",
        "name": "Sophia",
        "image": require('../assets/images/blank.jpeg'),
        "type": "video",
        "datetime": [
            { "date": "10/03/2025", "time": "19:25:00", "status": "incoming" }
        ],
        "missed": true
    }
];

  



export const Users = [
    {
        id: Math.random().toString(12).substring(2),
        name: 'Sahil',
        image: require('../assets/images/samuel.jpg'),
        message: 'Hello, how are you?',
        time: '10:00',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Sajal',
        image: require('../assets/images/tomi.png'),
        message: 'When are you coming over?',
        time: '11:28',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Rizil',
        image: require('../assets/images/samuel.jpg'),
        message: 'Just checking up on you',
        time: '09:48',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Raju',
        image: require('../assets/images/tomi.png'),
        message: 'Hi, what is your suggestion on the project?',
        time: '09:38',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Shivam',
        image: require('../assets/images/samuel.jpg'),
        message: 'I will be there in 5 minutes',
        time: '09:30',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Mohit',
        image: require('../assets/images/tomi.png'),
        message: 'I am on my way',
        time: '09:20',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Jai',
        image: require('../assets/images/samuel.jpg'),
        message: 'I am in the meeting',
        time: '09:10',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Himanshu',
        image: require('../assets/images/tomi.png'),
        message: 'I will call you back',
        time: '09:00',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Kunal',
        image: require('../assets/images/samuel.jpg'),
        message: 'I am in the office',
        time: '08:50',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Yuvraj',
        image: require('../assets/images/tomi.png'),
        message: 'I am in the meeting',
        time: '08:40',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Tanishq',
        image: require('../assets/images/samuel.jpg'),
        message: 'I am in the office',
        time: '08:30',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Sonu',
        image: require('../assets/images/tomi.png'),
        message: 'I am in the meeting',
        time: '08:20',
    },
    {
        id: Math.random().toString(12).substring(2),
        name: 'Rohit',
        image: require('../assets/images/samuel.jpg'),
        message: 'I am in the office',
        time: '08:10',
    },
]