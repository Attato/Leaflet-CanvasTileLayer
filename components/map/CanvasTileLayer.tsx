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

		this.handleTileLoad(tile, url, coords);
		return tile;
	}

	private handleTileLoad(tile: HTMLElement, url: string, coords: L.Coords) {
		const map: L.Map = this._map;
		const bounds = map.getPixelBounds();

		map.on('moveend', () => {
			const newBounds = map.getPixelBounds();

			// @ts-ignore
			const deltaX = Math.floor(newBounds.min.x - bounds.min.x);
			// @ts-ignore
			const deltaY = Math.floor(newBounds.min.y - bounds.min.y);

			console.log(deltaX, deltaY);
			tile.onload = () => {
				// удаляем оригинальный тайл, который был создан с помощью createTile
				this.removeTileElement(tile);
				// @ts-ignore
				const pos = this._getTilePos(coords);

				this.ctx?.drawImage(
					// @ts-ignore
					tile,
					pos.x - deltaX,
					pos.y - deltaY,
					// Надо узнать разницу координат мувенда и потом вычитать её из pos
					this.tileSize.x,
					this.tileSize.y
				);
			};
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
