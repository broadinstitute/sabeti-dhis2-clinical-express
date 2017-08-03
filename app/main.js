import DataLoader from './Data';



let getData = DataLoader()
 .on('loaded', data => { console.log(data.data); })