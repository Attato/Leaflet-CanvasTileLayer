import L from 'leaflet';

class CanvasTileLayer extends L.TileLayer {
	tileSize: number | L.Point | undefined;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);
		this.tileSize = options?.tileSize || 256;
		this.canvas = L.DomUtil.create('canvas', 'leaflet-tile-pane');
		this.ctx = this.canvas.getContext('2d');
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
		const tile = super.createTile(coords, done);
		const url = this.getTileUrl(coords);

		this.handleTileLoad(tile, url);
		return tile;
	}

	private handleTileLoad(tile: HTMLElement, url: string) {
		const map: L.Map = this._map;
		if (!map) {
			return;
		}

		const bounds: L.Bounds = map.getPixelBounds();
		const zoom: number = map.getZoom();

		const nwTilePoint = new L.Point(
			// @ts-ignore
			Math.floor(bounds.min.x / this.tileSize),
			// @ts-ignore
			Math.floor(bounds.min.y / this.tileSize)
		);

		const seTilePoint = new L.Point(
			// @ts-ignore
			Math.floor(bounds.max.x / this.tileSize),
			// @ts-ignore
			Math.floor(bounds.max.y / this.tileSize)
		);

		// @ts-ignore
		const max: number = map.options.crs.scale(zoom) / this.tileSize;

		for (let x = nwTilePoint.x; x <= seTilePoint.x; x++) {
			for (let y = nwTilePoint.y; y <= seTilePoint.y; y++) {
				const xTile = (x + max) % max;
				const yTile = (y + max) % max;
				console.log('tile ' + xTile + ' ' + yTile);
			}
		}

		const tileImage = new Image();
		tileImage.src = url;

		tileImage.onload = () => {
			this.removeTileElement(tile);
			this.ctx
				? this.ctx.drawImage(
						tileImage,
						0,
						0,
						this.canvas.width,
						this.canvas.height
				  )
				: console.log('!ctx');
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
