'use client';

import { MapContainer, Marker, Popup } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import L from 'leaflet';

import CanvasTileLayer from './CanvasTileLayer';

import style from './map.module.scss';

const Map = () => {
	const options: L.TileLayerOptions = {
		attribution: '© OpenStreetMap contributors',
		tileSize: 256,
		zoomReverse: false,
		detectRetina: false,
		crossOrigin: false,
		errorTileUrl: '',
	};

	return (
		<MapContainer scrollWheelZoom={true} className={style.map}>
			<CanvasTileLayer
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				options={options}
			/>
			{/* <Marker position={{ lat: 60.00927, lng: 30.3772 }}>
				<Popup>ООО "СТЦ"</Popup>
			</Marker> */}
		</MapContainer>
	);
};

export default Map;
