import L from 'leaflet';

class CanvasTileLayer extends L.TileLayer {
	tileSize: number | L.Point | undefined;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);
		this.tileSize = options?.tileSize || 256;
	}

	onAdd(map: L.Map): this {
		super.onAdd(map);
		map.on('move', this.update, this);
		this.update();

		return this;
	}

	onRemove(map: L.Map): this {
		super.onRemove(map);
		map.off('move', this.update, this);

		return this;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLCanvasElement {
		const canvas: HTMLCanvasElement = document.createElement('canvas');
		const size: L.Point = this.getTileSize();
		canvas.width = size.x;
		canvas.height = size.y;

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			throw new Error('Could not create canvas context');
		}

		const img: HTMLImageElement = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			done(undefined, canvas);
		};
		img.onerror = (e) => {
			done(new Error('error'), canvas);
		};
		img.src = this.getTileUrl(coords);
		return canvas;
	}

	update() {
		const map: L.Map = this._map;
		if (!map) {
			return;
		}

		const bounds: L.Bounds = map.getPixelBounds();
		const zoom: number = map.getZoom();

		// get NorthWest and SouthEast points
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

		// get max number of tiles in this zoom level

		// @ts-ignore
		const max: number = map.options.crs.scale(zoom) / this.tileSize;

		// enumerate visible tiles
		for (let x = nwTilePoint.x; x <= seTilePoint.x; x++) {
			for (let y = nwTilePoint.y; y <= seTilePoint.y; y++) {
				const xTile = (x + max) % max;
				const yTile = (y + max) % max;

				console.log('tile ' + xTile + ' ' + yTile);
			}
		}
	}
}

export default CanvasTileLayer;
