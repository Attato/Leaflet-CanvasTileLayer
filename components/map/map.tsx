'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import {
	MapContainer,
	TileLayer,
	ZoomControl,
	Marker,
	Popup,
} from 'react-leaflet';

import style from './map.module.scss';

const Map = () => {
	return (
		<MapContainer
			center={{ lat: 60.009, lng: 30.377 }}
			zoom={15}
			zoomControl={false}
			scrollWheelZoom={true}
			className={style.map}
		>
			<TileLayer
				attribution="&copy; <a href=&#34;https://www.openstreetmap.org/copyright&#34;>OpenStreetMap</a> contributors"
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<Marker position={{ lat: 60.00927, lng: 30.3772 }}>
				<Popup>ООО "СТЦ"</Popup>
			</Marker>
			<ZoomControl position="bottomright" />
		</MapContainer>
	);
};

export default Map;
