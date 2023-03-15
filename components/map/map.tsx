"use client";
import React, { useEffect } from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import CanvasTileLayer from "./CanvasTileLayer";

const Map = () => {
	useEffect(() => {
		const map = L.map("map").setView([60.00927, 30.3772], 17);

		const canvasTileLayer = new CanvasTileLayer(
			"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			{
				attribution: "Map data &copy; OpenStreetMap contributors",
				maxZoom: 18,
				tileSize: 256,
			},
		).addTo(map);

		const polyline = L.polyline(
			[
				[60.00984225370602, 30.379664897918705],
				[60.00979935110324, 30.383076667785648],
				[60.0089841910741, 30.38303375244141],
				[60.00984225370602, 30.379664897918705],
			],
			{ color: "red" },
		).addTo(map);

		return () => {
			map.remove();
		};
	}, []);

	return <div id="map"></div>;
};

export default Map;
