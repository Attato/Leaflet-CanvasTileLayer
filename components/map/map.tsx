'use client';
import React, { useEffect } from 'react';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import CanvasTileLayer from './CanvasTileLayer';

const Map = () => {
	useEffect(() => {
		const map = L.map('map').setView([59.939096, 30.315871], 16);

		new CanvasTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: 'Map data &copy; OpenStreetMap contributors',
			maxZoom: 18,
			tileSize: 256,
		}).addTo(map);

		L.polyline(
			[
				[59.9373, 30.312803],
				[59.938075, 30.313063],
				[59.938807, 30.311953],
				[59.940522, 30.316586],
				[59.939895, 30.317419],
				[59.940287, 30.318981],
				[59.939634, 30.318825],
				[59.939294, 30.317749],
				[59.938467, 30.31787],
				[59.938058, 30.317298],
				[59.937962, 30.316256],
				[59.93811, 30.314643],
				[59.9373, 30.312803],
			],
			{ color: 'red' }
		).addTo(map);

		return () => {
			map.remove();
		};
	}, []);

	return <div id="map"></div>;
};

export default Map;
