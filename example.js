// @ts-check

const {Adapter} = require('@clebert/node-bluez');
const {SystemDBus} = require('@clebert/node-d-bus');
const {PlantSensor} = require('./lib/cjs');

(async () => {
  const dBus = new SystemDBus();

  await dBus.connectAsExternal();

  try {
    await dBus.hello();

    const [adapter] = await Adapter.getAll(dBus);

    if (!adapter) {
      throw new Error('Adapter not found.');
    }

    const plantSensor = new PlantSensor(adapter, 'XX:XX:XX:XX:XX:XX');
    const unlockAdapter = await adapter.lock.aquire();

    try {
      const data = await plantSensor.getData();

      console.log('Temperature (°C):', data.temperature);
      console.log('Illuminance (lx):', data.illuminance);
      console.log('Moisture (%):', data.moisture);
      console.log('Conductivity (µS/cm):', data.conductivity);

      const properties = await plantSensor.getProperties();

      console.log('Battery level (%):', properties.batteryLevel);
      console.log('Firmware version:', properties.firmwareVersion);
    } finally {
      unlockAdapter();
    }
  } finally {
    dBus.disconnect();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
