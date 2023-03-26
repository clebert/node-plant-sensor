import {PlantSensor} from './lib/index.js';
import {Adapter} from '@clebert/node-bluez';

await Adapter.use(async (adapter) => {
  const plantSensor = new PlantSensor(adapter, `XX:XX:XX:XX:XX:XX`);
  const data = await plantSensor.getData();

  console.log(`Temperature (°C):`, data.temperature);
  console.log(`Illuminance (lx):`, data.illuminance);
  console.log(`Moisture (%):`, data.moisture);
  console.log(`Conductivity (µS/cm):`, data.conductivity);

  const properties = await plantSensor.getProperties();

  console.log(`Battery level (%):`, properties.batteryLevel);
  console.log(`Firmware version:`, properties.firmwareVersion);
});
