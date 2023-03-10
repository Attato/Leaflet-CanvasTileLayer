"use strict";

import L from "leaflet";

class CanvasTileLayer extends L.TileLayer {
	tileSize: L.Point;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);

		this.tileSize = this.getTileSize();
		this.canvas = L.DomUtil.create("canvas", "leaflet-tile-pane");
		this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLImageElement {
		const tile = super.createTile(coords, done) as HTMLImageElement;
		tile.crossOrigin = "Anonymous";
		const url = this.getTileUrl(coords);

		this.canvasRedraw(tile, url, coords);

		return tile;
	}

	private canvasRedraw(tile: HTMLImageElement, url: string, coords: L.Coords) {
		const map: L.Map = this._map;
		const bounds = map.getPixelBounds();

		// @ts-ignore
		const pos = this._getTilePos(coords);

		tile.onload = () => {
			// delete the original tile that was created with createTile
			this.removeTileElement(tile);

			this.ctx?.drawImage(
				// @ts-ignore
				tile,
				pos.x,
				pos.y,
				this.tileSize.x,
				this.tileSize.y,
			);
		};

		map.on("moveend", () => {
			const newBounds = map.getPixelBounds();

			let deltaX: number = 0;
			let deltaY: number = 0;

			if (newBounds.min && bounds.min) {
				deltaX = Math.floor(newBounds.min.x - bounds.min.x);
				deltaY = Math.floor(newBounds.min.y - bounds.min.y);
			}

			// L.DomUtil.setPosition(this.canvas, pos.subtract([deltaX, deltaY]));
			// L.DomUtil.setPosition(this.canvas, new L.Point(deltaX, deltaY));

			const imageData = this.ctx?.getImageData(
				pos.x,
				pos.y,
				this.tileSize.x,
				this.tileSize.y,
			);

			if (imageData) this.ctx?.putImageData(imageData, deltaX, deltaY);

			const tileIndexX = Object.values(this._tiles).map(
				(tile) => tile.coords.x / this.tileSize.x,
			);

			const tileIndexY = Object.values(this._tiles).map(
				(tile) => tile.coords.y / this.tileSize.y,
			);

			const minTileIndexX = Math.min(...tileIndexX);
			const minTileIndexY = Math.min(...tileIndexY);

			console.log(
				`Минимальный индекс по оси X: ${minTileIndexX}, Минимальный индекс по оси Y: ${minTileIndexY}`,
			);

			// TODO: redraw the corner of the canvas that needs to be updated based on the new tiles
		});

		tile.onerror = () => {
			console.log(`Failed to load tile: ${url}`);
		};
	}

	removeTileElement(tile: HTMLElement) {
		tile.parentNode?.removeChild(tile);
	}

	onAdd(map: L.Map): this {
		super.onAdd(map);

		this.getPane()?.appendChild(this.canvas);

		return this;
	}
}

export default CanvasTileLayer;
