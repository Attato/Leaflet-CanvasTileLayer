import L from "leaflet";

class CanvasTileLayer extends L.TileLayer {
	tileSize: L.Point;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);
		this.tileSize = this.getTileSize();
		this.canvas = L.DomUtil.create("canvas", "leaflet-tile-pane");
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = 1024;
		this.canvas.height = 1024;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
		console.log("ccccd", coords + "");

		const tile = super.createTile(coords, done);
		const url = this.getTileUrl(coords);

		this.handleTileLoad(tile, url, coords);
		return tile;
	}

	private handleTileLoad(tile: HTMLElement, url: string, coords: L.Coords) {
		const map: L.Map = this._map;
		const bounds: L.Bounds = map.getPixelBounds();
		const zoom: number = map.getZoom();

		const nwTilePoint = new L.Point(
			// округляем вниз до ближайшего целого числа

			// @ts-ignore
			Math.floor(bounds.min.x / this.tileSize.x),
			// @ts-ignore
			Math.floor(bounds.min.y / this.tileSize.y),
		);

		const seTilePoint = new L.Point(
			// округляем вверх до ближайшего целого числа

			// @ts-ignore
			Math.ceil(bounds.max.x / this.tileSize.x),
			// @ts-ignore
			Math.ceil(bounds.max.y / this.tileSize.y),
		);

		const max = Math.pow(2, zoom); // используем формулу для максимального значения координаты тайла на данном уровне зума

		tile.onload = () => {
			// удаляем оригинальный тайл, который был создан с помощью createTile
			this.removeTileElement(tile);
			// @ts-ignore
			const pos = this._getTilePos(coords);

			if (this.ctx) {
				this.ctx.drawImage(
					// @ts-ignore
					tile,
					pos.x,
					pos.y,
					// Надо узнать разницу координат мувенда и потом вычитать её из pos
					this.tileSize.x,
					this.tileSize.y,
				);
				console.log(
					coords.x,
					coords.y,
					"xPos: " + pos.x,
					"yPos: " + pos.y,
					`tileSize: ${this.tileSize.x}, ${this.tileSize.y}`,
				);
			} else {
				console.log("!ctx");
			}
		};

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
