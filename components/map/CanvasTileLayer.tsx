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
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
		const tile = super.createTile(coords, done);
		const url = this.getTileUrl(coords);

		this.handleTileLoad(tile, url, coords);
		return tile;
	}

	private handleTileLoad(tile: HTMLElement, url: string, coords: L.Coords) {
		const map: L.Map = this._map;
		const bounds: L.Bounds = map.getPixelBounds();
		const zoom: number = map.getZoom();

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
				console.log(pos, this._map.getPixelBounds().min.x);
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
