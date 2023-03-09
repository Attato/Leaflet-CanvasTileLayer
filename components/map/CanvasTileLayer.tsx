import L from 'leaflet';

class CanvasTileLayer extends L.TileLayer {
	tileSize: L.Point;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);
		this.tileSize = this.getTileSize();
		this.canvas = L.DomUtil.create('canvas', 'leaflet-tile-pane');
		this.ctx = this.canvas.getContext('2d');

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
		const tile = super.createTile(coords, done);
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
				this.tileSize.y
			);

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height
			);

			console.log(imageData);
		};

		map.on('moveend', () => {
			const newBounds = map.getPixelBounds();

			// @ts-ignore
			const deltaX = Math.floor(newBounds.min.x - bounds.min.x);
			// @ts-ignore
			const deltaY = Math.floor(newBounds.min.y - bounds.min.y);

			pos.x -= deltaX;
			pos.y -= deltaY;
			L.DomUtil.setPosition(this.canvas, pos.subtract([deltaX, deltaY]));
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
