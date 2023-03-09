import L from "leaflet";

class CanvasTileLayer extends L.TileLayer {
	tileSize: L.Point;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);
		this.tileSize = this.getTileSize();
		this.canvas = L.DomUtil.create("canvas", "leaflet-tile-pane");
		this.ctx = this.canvas.getContext("2d", { willReadFrequently: true }); // Fix Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true.

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
		const tile = super.createTile(coords, done) as HTMLImageElement;
		tile.crossOrigin = "Anonymous";
		const url = this.getTileUrl(coords);

		this.canvasRedraw(tile, url, coords);
		return tile;
	}

	private canvasRedraw(tile: HTMLElement, url: string, coords: L.Coords) {
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
				// Need to find out the difference in coordinates after onmoveend and then subtract it from pos
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
			L.DomUtil.setPosition(this.canvas, new L.Point(deltaX, deltaY));

			const imageData = this.ctx?.getImageData(
				pos.x,
				pos.y,
				this.tileSize.x,
				this.tileSize.y,
			);

			if (imageData) this.ctx?.putImageData(imageData, deltaX, deltaY);

			let arrTileIndexX = [];
			let arrTileIndexY = [];

			for (let tileKey in this._tiles) {
				let tile = this._tiles[tileKey];

				const tileIndexX: number = tile.coords.x / this.tileSize.x;
				const tileIndexY: number = tile.coords.y / this.tileSize.y;
				// console.log(tileIndexX);
				// tileIndexX 299.1875

				arrTileIndexX.push(tileIndexX);
				console.log(Math.min(...arrTileIndexX));

				// bounds inter

				// нужно найти наименьшие значения x и y, а потом перерисовать угол
			}

			// нужно пробежаться в цикле _this.tiles и понять какой тайл не закрашен
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
