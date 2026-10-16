// RPM's published brand/platform families, reviewed 11 October 2026.
// Chassis/year choices are presentation data; they are not verified fitment rules.
const car=(id,label,from=2000,to=2026,trims=['Standard','Sport'],heating=true)=>({id,label,years:[from,to],trims,heating});
export const BRANDS={
  BMW:{label:'BMW',slug:'bmw',interior:'G20 M Sport',mount:[.416,.531],source:'https://rpmcustoms.no/steering-wheels/bmw'},
  Mercedes:{label:'Mercedes-Benz',slug:'mercedes',interior:'W205 AMG Line',mount:[.445,.586],source:'https://rpmcustoms.no/steering-wheels/mercedes'},
  Audi:{label:'Audi',slug:'audi',interior:'B9 S line',mount:[.454,.526],source:'https://rpmcustoms.no/steering-wheels/audi'},
  Volkswagen:{label:'Volkswagen',slug:'volkswagen',interior:'Golf GTI',mount:[.444,.558],source:'https://rpmcustoms.no/collections/volkswagen'},
  Porsche:{label:'Porsche',slug:'porsche',interior:'911 Carrera',mount:[.482,.582],source:'https://rpmcustoms.no/collections/porsche'},
  Lamborghini:{label:'Lamborghini',slug:'lamborghini',interior:'Huracán',mount:[.467,.526],source:'https://rpmcustoms.no/collections/lamborghini'},
  Tesla:{label:'Tesla',slug:'tesla',interior:'Model 3',mount:[.419,.522],source:'https://rpmcustoms.no/collections/tesla'},
  Toyota:{label:'Toyota',slug:'toyota',interior:'GR Supra',mount:[.443,.560],source:'https://rpmcustoms.no/collections/toyota'},
  Nissan:{label:'Nissan',slug:'nissan',interior:'GT-R R35',mount:[.417,.533],source:'https://rpmcustoms.no/collections/nissan'}
};
export const VEHICLES={
  BMW:[
    car('g26','4 Series Gran Coupé / i4 · G26',2021),car('g60','5 Series · G60 (selected models)',2023),car('g83','M4 Convertible · G83',2021),car('g87','M2 · G87',2023),
    car('f21','1 Series · F21',2011,2019),car('f22','2 Series · F22',2014,2021),car('f23','2 Series Convertible · F23',2015,2021),
    car('f31','3 Series Touring · F31',2012,2019),car('f34','3 Series GT · F34',2013,2020),car('f33','4 Series Convertible · F33',2014,2020),car('f36','4 Series Gran Coupé · F36',2014,2021),
    car('f11','5 Series Touring · F11',2010,2017),car('f06','6 Series Gran Coupé · F06',2012,2018),car('f12','6 Series Convertible · F12',2011,2018),car('f13','6 Series Coupé · F13',2011,2018),car('f87','M2 · F87',2016,2021),car('f83','M4 Convertible · F83',2014,2020),car('f16','X6 · F16',2014,2019),
    car('g20','3 Series · G20',2019,2026,['M Sport','M340i']),car('g21','3 Series Touring · G21',2019),
    car('g22','4 Series · G22',2020),car('g23','4 Series Convertible · G23',2020),
    car('g30','5 Series · G30',2017,2023,['M Sport','M550i']),car('g05','X5 · G05',2018),
    car('g42','2 Series · G42',2021),car('g80','M3 · G80',2021,2026,['M3','Competition']),
    car('g82','M4 · G82',2021,2026,['M4','Competition']),car('x3m','X3 M',2019),car('x4m','X4 M',2019),
    car('f20','1 Series · F20',2011,2019),car('f30','3 Series · F30',2012,2019),
    car('f32','4 Series · F32',2013,2020),car('f10','5 Series · F10',2010,2017),
    car('f15','X5 · F15',2013,2018),car('f80','M3 · F80',2014,2018),car('f82','M4 · F82',2014,2020)
  ],
  Mercedes:[
    car('w206','C-Class · W206',2022,2026,['AMG Line','C43 AMG','C63 AMG']),car('w223','S-Class · W223',2021),car('x254','GLC · X254',2022),car('cle','CLE',2023),
    car('c257','CLS · C257',2018,2023),car('a-amg','A-Class AMG',2019,2026,['A35 AMG','A45 AMG']),car('cla-amg','CLA AMG',2019,2026,['CLA35 AMG','CLA45 AMG']),
    car('c117','CLA · C117',2013,2019),car('x156','GLA · X156',2014,2020),car('gle','GLE / GLE AMG',2015),
    car('w205','C-Class · W205',2015,2021,['AMG Line','C43 AMG','C63 AMG']),
    car('w213','E-Class · W213',2017,2023,['AMG Line','E43 AMG','E53 AMG','E63 AMG']),
    car('w222','S-Class · W222',2013,2020),car('x253','GLC · X253',2015,2022),
    car('amg-gt','AMG GT',2015,2026,['AMG GT','GT S','GT R']),
    car('latest-amg','Latest AMG platform · 2022+',2022,2026,['AMG Line','AMG Performance']),
    car('w204','C-Class · W204',2007,2014,['Standard','AMG Line','C63 AMG']),
    car('w212','E-Class · W212',2009,2016,['Standard','AMG Line','E63 AMG']),
    car('w221','S-Class · W221',2005,2013),car('w203','C-Class · W203',2000,2007),
    car('w211','E-Class · W211',2002,2009),car('w219','CLS · W219',2004,2010)
  ],
  Audi:[
    car('b9','A4 / S4 · B9',2017,2026,['S line','S4']),car('a4-b8','A4 · B8',2008,2015),
    car('a5-b8','A5 / S5 · B8',2008,2016),car('a5-b9','A5 / S5 · B9',2017,2026),
    car('rs5','RS5 · B9',2018,2026,['RS5']),car('a6-c7','A6 / S6 · C7',2011,2018),
    car('a6-c8','A6 / S6 · C8',2019),car('a7-c7','A7 · C7',2011,2018),car('a7-c8','A7 · C8',2019),
    car('a3-8v','A3 / S3 · 8V',2013,2020),car('a3-8y','A3 / S3 · 8Y',2020),
    car('rs3','RS3',2015,2026,['RS3']),car('rs4','RS4',2013,2026,['RS4']),
    car('rs6-c7','RS6 · C7',2013,2018,['RS6']),car('rs6-c8','RS6 · C8',2020,2026,['RS6']),
    car('q3','Q3',2011),car('q5','Q5 / SQ5',2018),car('rs7','RS7 · C8',2020,2026,['RS7']),car('e-tron-gt','e-tron GT / RS e-tron GT',2021),
    car('q-series','Q-Series',2010,2026,['Standard','S line','SQ / RSQ']),car('e-tron','e-tron',2019),
    car('r8','R8',2007,2024,['R8','V10']),car('tt','TT / TTS / TTRS',2006,2023,['TT','TTS','TTRS']),
    car('a4-b7','A4 · B7 (on request)',2004,2008)
  ],
  Volkswagen:[
    car('golf-mk7','Golf · Mk7',2013,2020,['Standard','GTI','R']),
    car('golf-mk7-5','Golf · Mk7.5',2017,2020,['GTI','R']),car('scirocco','Scirocco · R / GTI',2008,2017),
    car('golf-mk8','Golf · Mk8',2020,2026,['Standard','GTI','R']),car('polo','Polo',2010),
    car('passat-b8','Passat · B8',2015,2023),car('tiguan','Tiguan',2016),car('arteon','Arteon',2017,2024)
  ],
  Porsche:[
    car('911-991','911 · 991',2012,2019,['Carrera','Turbo','GT3']),
    car('911-992','911 · 992',2019,2026,['Carrera','Turbo','GT3']),
    car('911-997','911 · 997 (on request)',2004,2012,['Carrera','Turbo','GT3']),
    car('718-cayman','718 Cayman',2016,2026,['Cayman','GTS','GT4']),
    car('718-boxster','718 Boxster',2016,2026,['Boxster','GTS','Spyder']),
    car('panamera-971','Panamera · 971',2017,2024),car('macan-95b','Macan · 95B',2014),
    car('cayenne','Cayenne',2010),car('taycan','Taycan',2020)
  ],
  Lamborghini:[
    car('huracan','Huracán',2014,2024,['Standard','Performante','STO']),
    car('aventador','Aventador',2011,2022,['Standard','S','SVJ']),car('urus','Urus',2018),
    car('revuelto','Revuelto',2023)
  ],
  Tesla:[
    car('model-3','Model 3 · Pre-refresh',2017,2023,['Long Range','Performance']),
    car('highland','Model 3 · Highland',2024,2026,['Long Range','Performance']),
    car('model-y','Model Y',2020,2026,['Long Range','Performance']),
    car('model-s','Model S',2012,2026,['Long Range','Plaid']),car('model-x','Model X',2015,2026,['Long Range','Plaid'])
  ],
  Toyota:[
    car('land-cruiser-250','Land Cruiser 250 / Prado',2024),car('tacoma','Tacoma · Newer platform',2024),
    car('supra-a90','GR Supra · A90',2019,2026,['GR Supra','GR Supra 3.0']),
    car('gr-yaris','GR Yaris',2020),car('gr-corolla','GR Corolla',2023),
    car('gr86-zn8','GR86 · ZN8',2022),car('camry-xv70','Camry · XV70',2018,2024),
    car('land-cruiser-j300','Land Cruiser · J300',2021),car('86','86 (on request)',2012,2021)
  ],
  Nissan:[
    car('gtr-r35','GT-R · R35',2007,2025,['GT-R','NISMO']),car('z-rz34','400Z · RZ34',2023),
    car('370z-z34','370Z · Z34',2009,2020),car('350z-z33','350Z · Z33',2003,2009),
    car('300zx-z32','300ZX · Z32 (on request)',1989,2000,['Standard'],false),
    car('skyline-r32','Skyline · R32 (on request)',1989,1994,['Standard','GT-R'],false),
    car('skyline-r33','Skyline · R33 (on request)',1993,1998,['Standard','GT-R'],false),
    car('skyline-r34','Skyline · R34 (on request)',1998,2002,['Standard','GT-R'],false),
    car('silvia-s13','Silvia · S13 (on request)',1988,1994,['Standard'],false),
    car('silvia-s14','Silvia · S14 (on request)',1993,1999,['Standard'],false),
    car('silvia-s15','Silvia · S15 (on request)',1999,2002,['Standard'],false),car('patrol-y62','Patrol · Y62',2010)
  ]
};
// Default presentation models correspond to the representative cockpit assets.
for(const [brand,id] of [['BMW','g20'],['Mercedes','w205'],['Toyota','supra-a90']]){const list=VEHICLES[brand],i=list.findIndex(v=>v.id===id);list.unshift(...list.splice(i,1));}
export const VEHICLE_COUNT=Object.values(VEHICLES).reduce((n,list)=>n+list.length,0);
