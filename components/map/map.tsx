'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import style from './map.module.scss';

const Map = () => {
	return (
		<MapContainer
			center={{ lat: 51.505, lng: -0.09 }}
			zoom={13}
			scrollWheelZoom={false}
			className={style.map}
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
		</MapContainer>
	);
};

export default Map;
