var dht = require('dht-sensor');

var dhtSensor = dht.read(11, 4); // 11 : DHT11, 4 : BCM GPIO  

console.log(dhtSensor.humidity);
console.log(dhtSensor.temperature);