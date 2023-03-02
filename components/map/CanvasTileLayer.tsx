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
		const img = new Image();
		img.src = url;
		console.log(url);

		img.onload = () => {
			this.removeTileElement(tile);

			this.ctx
				? this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
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
