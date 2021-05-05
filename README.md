# Node.js Plant Sensor

[![][ci-badge]][ci-link] [![][version-badge]][version-link]
[![][license-badge]][license-link] [![][types-badge]][types-link]

[ci-badge]: https://github.com/clebert/node-plant-sensor/workflows/CI/badge.svg
[ci-link]: https://github.com/clebert/node-plant-sensor
[version-badge]: https://badgen.net/npm/v/@clebert/node-plant-sensor
[version-link]: https://www.npmjs.com/package/@clebert/node-plant-sensor
[license-badge]: https://badgen.net/npm/license/@clebert/node-plant-sensor
[license-link]: https://github.com/clebert/node-plant-sensor/blob/master/LICENSE
[types-badge]: https://badgen.net/npm/types/@clebert/node-plant-sensor
[types-link]: https://github.com/clebert/node-plant-sensor

> A Node.js API for the
> [Xiaomi Plant Sensor](https://xiaomi-mi.com/sockets-and-sensors/xiaomi-huahuacaocao-flower-care-smart-monitor/)
> with native TypeScript support.

This package runs only on Linux and uses BlueZ and D-Bus under the hood.

## Installation

```
npm install @clebert/node-plant-sensor @clebert/node-bluez @clebert/node-d-bus
```

## Features

- Designed from the ground up with TypeScript.
- Supports reading the temperature, illuminance, moisture, and conductivity.
- Supports reading the battery level and firmware version.
- Tested with Node.js 14 on Raspberry Pi OS Lite.

## Usage example

```js
import {Adapter} from '@clebert/node-bluez';
import {PlantSensor} from '@clebert/node-plant-sensor';

Adapter.use(async (adapter) => {
  const plantSensor = new PlantSensor(adapter, 'XX:XX:XX:XX:XX:XX');
  const data = await plantSensor.getData();

  console.log('Temperature (°C):', data.temperature);
  console.log('Illuminance (lx):', data.illuminance);
  console.log('Moisture (%):', data.moisture);
  console.log('Conductivity (µS/cm):', data.conductivity);

  const properties = await plantSensor.getProperties();

  console.log('Battery level (%):', properties.batteryLevel);
  console.log('Firmware version:', properties.firmwareVersion);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
```

## Configure D-Bus user permissions

Create the `/etc/dbus-1/system.d/node-bluez.conf` configuration file. The
username may need to be modified.

```xml
<!DOCTYPE busconfig PUBLIC "-//freedesktop//DTD D-BUS Bus Configuration 1.0//EN"
  "http://www.freedesktop.org/standards/dbus/1.0/busconfig.dtd">

<busconfig>
  <policy user="pi">
    <allow own="org.bluez"/>
    <allow send_destination="org.bluez"/>
    <allow send_interface="org.bluez.GattCharacteristic1"/>
    <allow send_interface="org.bluez.GattDescriptor1"/>
    <allow send_interface="org.freedesktop.DBus.ObjectManager"/>
    <allow send_interface="org.freedesktop.DBus.Properties"/>
  </policy>
</busconfig>
```

---

Copyright (c) 2021, Clemens Akens. Released under the terms of the
[MIT License](https://github.com/clebert/node-plant-sensor/blob/master/LICENSE).
