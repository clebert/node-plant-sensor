import {Adapter, Device} from '@clebert/node-bluez';
import {TextDecoder} from 'util';

export interface PlantSensorOptions {
  /** Default: `50` milliseconds (ms) */
  readonly pollInterval?: number;
}

export interface PlantSensorProperties {
  /** Battery level in percent (%) */
  readonly batteryLevel: number;
  readonly firmwareVersion: string;
}

export interface PlantSensorData {
  /** Temperature in degree Celsius (°C) */
  readonly temperature: number;

  /** Illuminance in lux (lx) */
  readonly illuminance: number;

  /** Moisture in percent (%) */
  readonly moisture: number;

  /** Conductivity in microsiemens per centimeter (µS/cm) */
  readonly conductivity: number;
}

export class PlantSensor {
  readonly #adapter: Adapter;
  readonly #deviceAddress: string;
  readonly #options: PlantSensorOptions;

  constructor(
    adapter: Adapter,
    deviceAddress: string,
    options: PlantSensorOptions = {}
  ) {
    this.#adapter = adapter;
    this.#deviceAddress = deviceAddress;
    this.#options = options;
  }

  async getData(): Promise<PlantSensorData> {
    const device = await this.#findDevice();

    await device.connect();

    try {
      const sensorDataWriteCharacteristic = await device.waitForGattCharacteristic(
        '00001a00-0000-1000-8000-00805f9b34fb',
        {pollInterval: this.#options.pollInterval}
      );

      await sensorDataWriteCharacteristic.writeValue([0xa0, 0x1f]);

      const sensorDataReadCharacteristic = await device.waitForGattCharacteristic(
        '00001a01-0000-1000-8000-00805f9b34fb',
        {pollInterval: this.#options.pollInterval}
      );

      const sensorData = new DataView(
        new Uint8Array(await sensorDataReadCharacteristic.readValue()).buffer
      );

      return {
        temperature: sensorData.getInt16(0, true) / 10,
        illuminance: sensorData.getUint32(3, true),
        moisture: sensorData.getUint8(7),
        conductivity: sensorData.getUint16(8, true),
      };
    } finally {
      await device.disconnect();
    }
  }

  async getProperties(): Promise<PlantSensorProperties> {
    const device = await this.#findDevice();

    await device.connect();

    try {
      const propertiesReadCharacteristic = await device.waitForGattCharacteristic(
        '00001a02-0000-1000-8000-00805f9b34fb',
        {pollInterval: this.#options.pollInterval}
      );

      const properties = new DataView(
        new Uint8Array(await propertiesReadCharacteristic.readValue()).buffer
      );

      return {
        batteryLevel: properties.getUint8(0),
        firmwareVersion: new TextDecoder().decode(properties.buffer.slice(2)),
      };
    } finally {
      await device.disconnect();
    }
  }

  readonly #findDevice = async (): Promise<Device> => {
    await this.#adapter.setPowered(true);

    await this.#adapter.setDiscoveryFilter({
      serviceUUIDs: ['00001204-0000-1000-8000-00805f9b34fb'],
      transport: 'le',
    });

    const [device] = await this.#adapter.getDevices(this.#deviceAddress);

    if (device) {
      return device;
    }

    await this.#adapter.startDiscovery();

    try {
      return await this.#adapter.waitForDevice(this.#deviceAddress, {
        pollInterval: this.#options.pollInterval,
      });
    } finally {
      await this.#adapter.stopDiscovery();
    }
  };
}
