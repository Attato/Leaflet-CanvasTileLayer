import L from "leaflet";

class CanvasTileLayer extends L.TileLayer {
	tileSize: number | L.Point;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);
		this.tileSize = options?.tileSize || 256;
	}

	onAdd(map: L.Map): this {
		super.onAdd(map);
		map.on("move", this.update, this);
		this.update();

		return this;
	}

	onRemove(map: L.Map): this {
		super.onRemove(map);
		map.off("move", this.update, this);

		return this;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLCanvasElement {
		const canvas = document.createElement("canvas");
		const size = this.getTileSize();
		canvas.width = size.x;
		canvas.height = size.y;

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Could not create canvas context");
		}

		const img = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			done(undefined, canvas);
		};
		img.onerror = (e) => {
			done(new Error("error"), canvas);
		};
		img.src = this.getTileUrl(coords);
		return canvas;
	}

	update() {
		const map = this._map;
		if (!map) {
			return;
		}

		var bounds = map.getPixelBounds();
		var zoom = map.getZoom();

		// get NorthWest and SouthEast points
		var nwTilePoint = new L.Point(
			// @ts-ignore
			Math.floor(bounds.min.x / this.tileSize),
			// @ts-ignore
			Math.floor(bounds.min.y / this.tileSize),
		);

		var seTilePoint = new L.Point(
			// @ts-ignore
			Math.floor(bounds.max.x / this.tileSize),
			// @ts-ignore
			Math.floor(bounds.max.y / this.tileSize),
		);

		// get max number of tiles in this zoom level

		// @ts-ignore
		var max = map.options.crs.scale(zoom) / this.tileSize;

		// enumerate visible tiles
		for (var x = nwTilePoint.x; x <= seTilePoint.x; x++) {
			for (var y = nwTilePoint.y; y <= seTilePoint.y; y++) {
				var xTile = (x + max) % max;
				var yTile = (y + max) % max;

				console.log("tile " + xTile + " " + yTile);
			}
		}
	}
}

export default CanvasTileLayer;
