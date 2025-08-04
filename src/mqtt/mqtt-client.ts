import mqtt, { IClientOptions } from "mqtt";
import { AirTemperature, Stasjon } from "../db/frost";

const opts: IClientOptions = {
  username: process.env["MQTT_USER"],
  password: process.env["MQTT_PASS"],
};

export const client = mqtt.connect("mqtt://homeassistant.local:1883", opts);

client.on("connect", () => {
  client.subscribe("homeassistant/status");
});

client.on("message", (topic, message) => {
  // message is Buffer
  console.log(message.toString());
});

export function mqttPublishState(temps: AirTemperature[]) {
  temps.forEach((temp) => {
    client.publishAsync(
      `vaerdings/${temp.sourceId}/state`,
      JSON.stringify({ temperature: temp.value }),
    );
  });
}
export function mqttDiscoveryPublish({ stasjoner }: { stasjoner: Stasjon[] }) {
  const topic = `homeassistant/device/vaerdings/config`;
  const cmpsActive: Record<string, any> = {};
  const cmpsAll = stasjoner.reduce(
    (acc, curr) => {
      if (curr.favoritt === false) {
        acc[curr.id] = {
          p: "sensor",
        };
      } else {
        acc[curr.id] = {
          name: curr.shortName,
          p: "sensor",
          device_class: "temperature",
          unit_of_measurement: "°C",
          value_template: "{{ value_json.temperature }}",
          unique_id: `vaerdings_${curr.id}_temp`,
          state_topic: `vaerdings/${curr.id}/state`,
        };
        cmpsActive[curr.id] = acc[curr.id];
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  const data = {
    dev: {
      ids: "vaerdings",
      name: "Vaerdings",
      mf: "github/bovan",
      mdl: "xya",
      sw: "1.0",
      sn: "f00f00f00",
      hw: "1.0",
    },
    o: {
      name: "bvn-github",
      sw: "1.0",
      url: "https://github.com/bovan/v-rdings",
    },
    qos: 2,
  };
  // Send first update to notify of deletions
  client.publish(
    topic,
    JSON.stringify({ ...data, cmps: cmpsAll }),
    { retain: true },
    (error) => {
      if (error) {
        console.error("Failed to send discovery message 1:", error);
      }
    },
  );
  // Send second update to notify of active sensors
  client.publish(
    topic,
    JSON.stringify({ ...data, cmps: cmpsActive }),
    { retain: true },
    (error) => {
      if (error) {
        console.error("Failed to send discovery message 2:", error);
      }
    },
  );
}
