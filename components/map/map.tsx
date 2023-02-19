'use client';

import {
	MapContainer,
	TileLayer,
	ZoomControl,
	Marker,
	Popup,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import L from 'leaflet';

import CanvasTileLayer from './CanvasTileLayer';

import style from './map.module.scss';

const Map = () => {
	const options: L.TileLayerOptions = {
		attribution: '© OpenStreetMap contributors',
		minZoom: 2,
		maxZoom: 18,
		tileSize: 256,
		zoomOffset: 0,
		zoomReverse: false,
		detectRetina: false,
		crossOrigin: false,
		errorTileUrl: '',
	};

	return (
		<MapContainer
			zoomControl={false}
			scrollWheelZoom={true}
			className={style.map}
		>
			<CanvasTileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				options={options}
			/>
			{/* <Marker position={{ lat: 60.00927, lng: 30.3772 }}>
				<Popup>ООО "СТЦ"</Popup>
			</Marker>
			<ZoomControl position="bottomright" /> */}
			<div>dsfdsf</div>
		</MapContainer>
	);
};

export default Map;
