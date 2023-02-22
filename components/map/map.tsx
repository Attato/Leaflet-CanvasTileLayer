"use client";
import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import CanvasTileLayer from "./CanvasTileLayer";

function Map() {
	const ref = useRef<any>();
	useEffect(() => {
		if (ref.current) {
			return;
		}
		ref.current = L.map("map", {
			center: [-29.5, 145],
			zoom: 3.5,
		});

		const canvasTileLayer = new CanvasTileLayer(
			"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			{
				attribution:
					'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
				maxZoom: 18,
			},
		).addTo(ref.current);
	}, []);

	return <div id="map"></div>;
}

export default Map;
