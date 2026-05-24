export const C = {
  red: '#FF3B2F', amber: '#FFB400', green: '#00C890', blue: '#2A96FF', cyan: '#00D2E0',
  text: '#C0CFDF', text2: '#6A85A8', muted: '#3A4F6C',
  panel: '#090E1A', panel2: '#0C1220', b1: '#122030', b2: '#1C3045', bg: '#070B14',
};

export const SEV = {
  FATAL:    { c: '#FF3B2F', bg: 'rgba(255,59,47,0.12)',  bd: 'rgba(255,59,47,0.35)' },
  SERIOUS:  { c: '#FFB400', bg: 'rgba(255,180,0,0.12)',  bd: 'rgba(255,180,0,0.35)' },
  MODERATE: { c: '#FF7B00', bg: 'rgba(255,123,0,0.1)',   bd: 'rgba(255,123,0,0.3)'  },
  MINOR:    { c: '#00C890', bg: 'rgba(0,200,144,0.1)',   bd: 'rgba(0,200,144,0.3)'  },
};

export const FARS = [
  {id:'FARS-GA23-0847',lat:33.7191,lng:-84.4621,location:'I-285 W & Campbellton Rd SW',severity:'FATAL',date:'2023-08-19',time:'01:47',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:3,factors:['Speeding','DUI'],type:'Multi-vehicle'},
  {id:'FARS-GA23-0312',lat:33.6470,lng:-84.4350,location:'I-285 S & Old National Hwy',severity:'FATAL',date:'2023-04-07',time:'22:15',weather:'Rain',road:'Wet',vehicles:3,fatalities:2,injuries:1,factors:['Wet road','Speeding'],type:'Chain reaction'},
  {id:'FARS-GA22-1203',lat:33.7200,lng:-84.2930,location:'I-285 E & Glenwood Ave SE',severity:'FATAL',date:'2022-11-12',time:'03:22',weather:'Clear',road:'Dry',vehicles:1,fatalities:1,injuries:0,factors:['DUI','Speeding'],type:'Single vehicle'},
  {id:'FARS-GA23-0519',lat:33.7410,lng:-84.5200,location:'I-20 W at Thornton Rd',severity:'SERIOUS',date:'2023-06-22',time:'17:45',weather:'Clear',road:'Dry',vehicles:2,fatalities:0,injuries:4,factors:['Distracted driving','Rush hour'],type:'Rear-end'},
  {id:'FARS-GA22-0876',lat:33.7430,lng:-84.3200,location:'I-20 E at Moreland Ave',severity:'FATAL',date:'2022-09-03',time:'14:30',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:2,factors:['Lane change','Speeding'],type:'Sideswipe'},
  {id:'FARS-GA23-0731',lat:33.7002,lng:-84.4901,location:'Campbellton Rd SW & Cascade Ave',severity:'FATAL',date:'2023-09-14',time:'20:55',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:1,factors:['Red light','Speeding'],type:'T-bone'},
  {id:'FARS-GA22-0445',lat:33.6950,lng:-84.5050,location:'Campbellton Rd SW & Centra Villa Dr',severity:'SERIOUS',date:'2022-07-28',time:'23:10',weather:'Clear',road:'Dry',vehicles:1,fatalities:0,injuries:2,factors:['DUI','Speeding'],type:'Run-off road'},
  {id:'FARS-GA23-0622',lat:33.7001,lng:-84.4200,location:'Metropolitan Pkwy SW & Sullivan Rd',severity:'FATAL',date:'2023-07-31',time:'00:23',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:3,factors:['DUI','Speeding'],type:'Head-on'},
  {id:'FARS-GA22-1108',lat:33.6880,lng:-84.4150,location:'Metropolitan Pkwy SW & Sylvan Rd',severity:'FATAL',date:'2022-10-15',time:'02:44',weather:'Clear',road:'Dry',vehicles:1,fatalities:1,injuries:0,factors:['DUI'],type:'Fixed object'},
  {id:'FARS-GA23-0234',lat:33.7312,lng:-84.3401,location:'Moreland Ave SE & Memorial Dr',severity:'FATAL',date:'2023-03-29',time:'19:37',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:2,factors:['Red light'],type:'Angle collision'},
  {id:'FARS-GA22-0789',lat:33.7380,lng:-84.3290,location:'Memorial Dr SE & Flat Shoals Ave',severity:'SERIOUS',date:'2022-08-16',time:'21:15',weather:'Clear',road:'Dry',vehicles:2,fatalities:0,injuries:3,factors:['Speeding','Red light'],type:'Angle collision'},
  {id:'FARS-GA23-0415',lat:33.7601,lng:-84.4501,location:'Donald Lee Hollowell Pkwy & Hollywood Rd',severity:'FATAL',date:'2023-05-18',time:'01:12',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:1,factors:['DUI','Speeding'],type:'Head-on'},
  {id:'FARS-GA23-0901',lat:33.8401,lng:-84.3101,location:'Buford Hwy NE & Clairmont Rd',severity:'FATAL',date:'2023-10-02',time:'08:22',weather:'Fog',road:'Wet',vehicles:2,fatalities:1,injuries:2,factors:['Fog','Speeding'],type:'Head-on'},
  {id:'FARS-GA22-1345',lat:33.8601,lng:-84.2950,location:'Buford Hwy NE & Shallowford Rd',severity:'SERIOUS',date:'2022-12-05',time:'17:55',weather:'Rain',road:'Wet',vehicles:3,fatalities:0,injuries:5,factors:['Wet road','Rush hour'],type:'Chain reaction'},
  {id:'FARS-GA23-0156',lat:33.7580,lng:-84.3930,location:'I-75/85 Connector at 10th St',severity:'SERIOUS',date:'2023-02-14',time:'07:30',weather:'Clear',road:'Dry',vehicles:4,fatalities:0,injuries:6,factors:['Rush hour','Distracted driving'],type:'Multi-vehicle'},
  {id:'FARS-GA22-0567',lat:33.7620,lng:-84.3890,location:'I-75/85 Connector at Spring St',severity:'FATAL',date:'2022-06-10',time:'03:15',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:1,factors:['DUI','Speeding'],type:'Rear-end'},
  {id:'FARS-GA23-0678',lat:33.7050,lng:-84.3020,location:'Flat Shoals Rd & Gresham Rd SE',severity:'FATAL',date:'2023-08-04',time:'22:48',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:2,factors:['Red light','Speeding'],type:'Angle collision'},
  {id:'FARS-GA23-0989',lat:33.7700,lng:-84.3050,location:'I-285 NE at Chamblee-Tucker Rd',severity:'SERIOUS',date:'2023-11-11',time:'06:15',weather:'Fog',road:'Wet',vehicles:2,fatalities:0,injuries:3,factors:['Fog','Speeding'],type:'Rear-end'},
  {id:'FARS-GA22-0234',lat:33.8050,lng:-84.3801,location:'I-285 N at Peachtree Industrial Blvd',severity:'FATAL',date:'2022-04-23',time:'02:10',weather:'Clear',road:'Dry',vehicles:1,fatalities:1,injuries:0,factors:['DUI','Speeding'],type:'Fixed object'},
  {id:'FARS-GA23-0345',lat:33.8200,lng:-84.3650,location:'SR-400 N at Holcomb Bridge Rd',severity:'SERIOUS',date:'2023-04-19',time:'17:20',weather:'Clear',road:'Dry',vehicles:3,fatalities:0,injuries:4,factors:['Rush hour','Distracted'],type:'Rear-end'},
  {id:'FARS-GA23-0554',lat:33.6750,lng:-84.4450,location:'Stonewall Tell Rd & Camp Creek Pkwy',severity:'FATAL',date:'2023-06-07',time:'11:30',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:2,factors:['Stop sign','Speeding'],type:'Angle collision'},
  {id:'FARS-GA22-1456',lat:33.8650,lng:-84.4650,location:'I-75 N at Delk Rd, Cobb County',severity:'FATAL',date:'2022-11-28',time:'05:45',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:1,factors:['DUI','Wrong-way driver'],type:'Head-on'},
  {id:'FARS-GA23-0788',lat:33.7500,lng:-84.2700,location:'I-20 E at Panola Rd, DeKalb',severity:'SERIOUS',date:'2023-09-22',time:'16:10',weather:'Rain',road:'Wet',vehicles:3,fatalities:0,injuries:5,factors:['Wet road','Rush hour'],type:'Chain reaction'},
  {id:'FARS-GA23-0432',lat:33.7100,lng:-84.4600,location:'Camp Creek Pkwy & I-285',severity:'FATAL',date:'2023-05-01',time:'21:33',weather:'Clear',road:'Dry',vehicles:2,fatalities:1,injuries:3,factors:['Speeding','DUI'],type:'Multi-vehicle'},
  {id:'FARS-GA22-0321',lat:33.7300,lng:-84.4800,location:'Fulton Industrial Blvd SW & I-20',severity:'FATAL',date:'2022-07-04',time:'02:20',weather:'Clear',road:'Dry',vehicles:3,fatalities:2,injuries:1,factors:['DUI','Speeding'],type:'Multi-vehicle'},
  {id:'FARS-GA23-0267',lat:33.7890,lng:-84.4200,location:'I-75 N at Howell Mill Rd',severity:'SERIOUS',date:'2023-03-10',time:'08:05',weather:'Rain',road:'Wet',vehicles:4,fatalities:0,injuries:7,factors:['Wet road','Rush hour'],type:'Chain reaction'},
];

export const TEMPLATES = [
  {type:'Multi-vehicle collision',location:'I-285 W & Cascade Rd SW',lat:33.713,lng:-84.471,severity:'FATAL',vehicles:3,fatalities:0,injuries:4,weather:'Clear',road:'Dry',factors:['Speeding','Distracted'],desc:'3-vehicle collision blocking left 2 lanes, possible entrapment reported'},
  {type:'Wrong-way driver',location:'I-75 N at Northside Dr',lat:33.788,lng:-84.415,severity:'FATAL',vehicles:1,fatalities:0,injuries:0,weather:'Clear',road:'Dry',factors:['DUI','Wrong-way'],desc:'Multiple 911 calls — wrong-way vehicle northbound on I-75'},
  {type:'Debris in roadway',location:'I-20 E at Glenwood Ave',lat:33.742,lng:-84.330,severity:'MODERATE',vehicles:1,fatalities:0,injuries:1,weather:'Clear',road:'Dry',factors:['Road debris'],desc:'Large debris blocking right lane, possible tire blowout source'},
  {type:'Pedestrian struck',location:'Moreland Ave SE & DeKalb Ave',lat:33.754,lng:-84.345,severity:'SERIOUS',vehicles:1,fatalities:0,injuries:1,weather:'Clear',road:'Dry',factors:['Pedestrian'],desc:'Pedestrian struck at crosswalk, caller reports victim conscious'},
  {type:'Signal failure',location:'Buford Hwy NE & Clairmont Rd',lat:33.840,lng:-84.310,severity:'MODERATE',vehicles:0,fatalities:0,injuries:0,weather:'Rain',road:'Wet',factors:['Infrastructure'],desc:'Signal completely out, significant backup forming'},
  {type:'Jackknifed tractor-trailer',location:'I-285 S at Langford Pkwy',lat:33.649,lng:-84.436,severity:'SERIOUS',vehicles:1,fatalities:0,injuries:1,weather:'Rain',road:'Wet',factors:['Large vehicle','Wet road'],desc:'18-wheeler jackknifed blocking 3 lanes, fuel leak reported'},
  {type:'Multi-vehicle collision',location:'Donald Hollowell Pkwy & MLK Jr Dr',lat:33.756,lng:-84.448,severity:'SERIOUS',vehicles:2,fatalities:0,injuries:3,weather:'Clear',road:'Dry',factors:['Red light','Speeding'],desc:'2-vehicle T-bone, multiple airbag deployments'},
  {type:'Hit and run',location:'Metropolitan Pkwy & Sylvan Rd SW',lat:33.689,lng:-84.416,severity:'SERIOUS',vehicles:1,fatalities:0,injuries:2,weather:'Clear',road:'Dry',factors:['Hit and run'],desc:'Victim on roadway, suspect fled northbound in dark sedan'},
];

let _counter = 1;
export function mkIncident() {
  const t = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const minsAgo = Math.floor(Math.random() * 38) + 1;
  return {
    ...t,
    id: `INC-${String(_counter++).padStart(4, '0')}`,
    isLive: true,
    status: 'ACTIVE',
    minsAgo,
    lat: t.lat + (Math.random() - 0.5) * 0.004,
    lng: t.lng + (Math.random() - 0.5) * 0.004,
  };
}

export function nearbyFARS(inc, r = 0.07) {
  return FARS.filter(
    (f) => Math.sqrt((f.lat - inc.lat) ** 2 + (f.lng - inc.lng) ** 2) < r
  );
}
