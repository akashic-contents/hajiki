import * as box2d from "@akashic-extension/akashic-box2d";

/** 2次元ベクトル */
const b2Vec2 = box2d.Box2DWeb.Common.Math.b2Vec2;
/** 2×2 の行列 */
const b2Mat22 = box2d.Box2DWeb.Common.Math.b2Mat22;

/** 物理世界のプロパティ */
const worldProperty = {
	gravity: [0.0, 0.0], // 重力の方向（m/s^2）
	scale: 50, // スケール（pixel/m）
	sleep: true // 停止した物体を演算対象としないかどうか
};
/** 物理エンジンの世界 */
const physics = new box2d.Box2D(worldProperty);

/** おはじきを弾く力 */
const power = 10;

/** おはじきのパラメータ */
const hajikiParameter = {
	appear: {
		width: 1.0 * worldProperty.scale,
		height: 1.0 * worldProperty.scale
	},
	/** 物理定義 */
	physics: {
		/** 物理挙動 */
		body: physics.createBodyDef({
			type: box2d.BodyType.Dynamic // 自由に動ける物体
		}),
		/** 物理性質 */
		fixture: physics.createFixtureDef({
			density: 5.0, // 密度
			friction: 1.0, // 摩擦係数
			restitution: 0.999, // 反発係数
			shape: physics.createCircleShape(1.0 * worldProperty.scale) // 衝突判定の形（直径 1m の円形）
		})
	}
};

/** 壁の生成パラメータ */
const wallParameter = {
	appear: {
		width: 0.3 * worldProperty.scale,
		height: g.game.height,
		cssColor: "royalblue"
	},
	physics: {
		body: physics.createBodyDef({
			type: box2d.BodyType.Static // 固定されて動かない物体
		}),
		fixture: physics.createFixtureDef({
			density: 1.0,
			friction: 0.3,
			restitution: 0.7,
			shape: physics.createRectShape(0.3 * worldProperty.scale, g.game.height)
		})
	}
};
/** 床・天井の生成パラメータ */
const floorParameter = {
	appear: {
		width: g.game.width,
		height: 0.3 * worldProperty.scale,
		cssColor: "royalblue"
	},
	physics: {
		body: physics.createBodyDef({
			type: box2d.BodyType.Static
		}),
		fixture: physics.createFixtureDef({
			density: 1.0,
			friction: 0.3,
			restitution: 0.7,
			shape: physics.createRectShape(g.game.width, 0.3 * worldProperty.scale)
		})
	}
};

function main(): void {
	const scene = new g.Scene({
		game: g.game,
		assetIds: ["circle", "circle_touch", "arrow"]
	});

	scene.onLoad.add(function() {
		// 壁を生成
		createWall(scene);

		// おはじきを7個ランダムな位置に生成する
		for (let i = 0; i < 7; ++i) {
			createHajiki(scene, randomPosition());
		}

		scene.onUpdate.add(function() {
			// 物理エンジンの世界をすすめる
			// ※ step関数の引数は秒数なので、1フレーム分の時間（1.0 / g.game.fps）を指定する
			physics.step(1.0 / g.game.fps);
		});

		let begin: box2d.Box2DWeb.Common.Math.b2Vec2;
		scene.onPointDownCapture.add((event) => {
			begin = new b2Vec2(event.point.x, event.point.y);
		});
		scene.onPointUpCapture.add((event) => {
			const end = new b2Vec2(event.startDelta.x, event.startDelta.y);
			end.Add(begin);
		});
	});

	g.game.pushScene(scene);
}

/**
 * オブジェクトの中心座標を計算する
 * @param {g.E} obj 中心座標を計算するオブジェクト
 */
function calcCenter(obj: g.E): box2d.Box2DWeb.Common.Math.b2Vec2 {
	return physics.vec2(obj.width / 2, obj.height / 2);
}

/**
 * ランダムに生成された座標を返す
 * ※ 生成される座標は画面の外枠から 1.0m 内側に限定される
 */
function randomPosition(): box2d.Box2DWeb.Common.Math.b2Vec2 {
	const scale = worldProperty.scale;
	const x = g.game.random.generate() * (g.game.width - scale) + scale;
	const y = g.game.random.generate() * (g.game.height - scale) + scale;
	return physics.vec2(x, y);
}

/**
 * 衝突判定を持つ矩形を生成する
 * @param {g.Scene} scene 描画を行うシーン
 * @param {Object} parameter 矩形の生成パラメータ
 */
function createRect(scene: g.Scene, parameter: typeof wallParameter): box2d.EBody | null {
	// 表示用の矩形（1m × 1m）を生成
	const rect = new g.FilledRect({
		scene: scene,
		width: parameter.appear.width,
		height: parameter.appear.height,
		cssColor: parameter.appear.cssColor
	});
	scene.append(rect);

	// 表示用の矩形と衝突判定を結び付けて返す
	return physics.createBody(rect, parameter.physics.body, parameter.physics.fixture);
}

/**
 * 衝突判定を持つ円を生成する
 * @param {g.Scene} scene 描画を行うシーン
 * @param {Object} parameter 円の生成パラメータ
 */
function createCircle(scene: g.Scene, parameter: typeof hajikiParameter): box2d.EBody {
	// 画像をまとめる空のエンティティを生成
	const entity = new g.E({
		scene: scene,
		width: parameter.appear.width,
		height: parameter.appear.height
	});
	scene.append(entity);

	// 表示用の円形を生成
	// ※ AkashicEngineでは円を描画することができないので、画像で描画する
	const circle = new g.Sprite({
		scene: scene,
		src: scene.asset.getImageById("circle"),
		srcWidth: 100,
		srcHeight: 100,
		width: parameter.appear.width,
		height: parameter.appear.height
	});
	entity.append(circle);
	// タッチされたとき用の円形スプライトを生成
	const circleTouch = new g.Sprite({
		scene: scene,
		src: scene.asset.getImageById("circle_touch"),
		srcWidth: 100,
		srcHeight: 100,
		width: parameter.appear.width,
		height: parameter.appear.height,
		hidden: true
	});
	entity.append(circleTouch);

	// タッチの有無で画像を切り替える
	// タッチされたときにタッチ用の画像を表示
	entity.onPointDown.add(function() {
		circle.hide();
		circleTouch.show();
	});
	// タッチが解除されたときに通常時の画像を表示
	entity.onPointUp.add(function() {
		circle.show();
		circleTouch.hide();
	});

	// 表示用の円形と衝突判定を結び付けて返す
	return physics.createBody(entity, parameter.physics.body, parameter.physics.fixture);
}

function createWall(scene: g.Scene): void {
	// 左の壁を生成する
	const leftWall = createRect(scene, wallParameter);
	const leftWallPos = physics.vec2(0, 0);
	leftWallPos.Add(calcCenter(leftWall.entity));
	leftWall.b2Body.SetPosition(leftWallPos);

	// 右の壁を生成する
	const rightWall = createRect(scene, wallParameter);
	const rightWallPos = physics.vec2(g.game.width - rightWall.entity.width, 0);
	rightWallPos.Add(calcCenter(rightWall.entity));
	rightWall.b2Body.SetPosition(rightWallPos);

	// 床を生成する
	const floor = createRect(scene, floorParameter);
	const floorPos = physics.vec2(0, g.game.height - floor.entity.height);
	floorPos.Add(calcCenter(floor.entity));
	floor.b2Body.SetPosition(floorPos);

	// 天井を生成する
	const ceil = createRect(scene, floorParameter);
	const ceilPos = physics.vec2(0, 0);
	ceilPos.Add(calcCenter(ceil.entity));
	ceil.b2Body.SetPosition(ceilPos);
}

/**
 * おはじきを生成する
 * @param {g.Scene} scene 描画を行うシーン
 * @param {b2Vec2} position おはじきを設置する座標
 */
function createHajiki(scene: g.Scene, position: box2d.Box2DWeb.Common.Math.b2Vec2): void {
	const hajiki = createCircle(scene, hajikiParameter);
	hajiki.b2Body.SetPosition(position);
	hajiki.entity.touchable = true;

	// 足りない物理情報を付与する
	// ※ 今回は見下ろし視点なので、独自に抵抗を持たせる
	// 速度の減衰率を設定
	hajiki.b2Body.SetLinearDamping(0.5);
	// 角速度の減衰率を設定
	hajiki.b2Body.SetAngularDamping(0.5);

	let arrow: g.Sprite = null; // 矢印画像
	let anchor: box2d.Box2DWeb.Common.Math.b2Vec2; // タッチ開始座標

	// おはじきを引っ張ったときの処理を追加
	hajiki.entity.onPointDown.add((event) => {
		// 既に矢印画像が生成されている場合は削除しておく
		if (arrow !== null) {
			arrow.destroy();
		}

		// おはじきの移動をストップ
		hajiki.b2Body.SetLinearVelocity(physics.vec2(0, 0));
		hajiki.b2Body.SetAngularVelocity(0);

		// タッチした位置の絶対座標を計算する
		// ※ Box2Dが必要とするタッチ座標は、画面左上を原点とした絶対座標。
		// ※ g.PointDownEventから取得できる座標は、ポインティング対象からの
		//    相対座標なので、タッチ座標に対象となるb2Bodyの回転を与えた後、
		//    b2Bodyの座標を足すことで絶対座標へと変換する。
		// ※ 回転の軸をg.Entityの中心にするため、回転の前にタッチ座標から
		//    中心座標を引いておく。
		anchor = physics.vec2(event.point.x, event.point.y);
		anchor.Subtract(calcCenter(hajiki.entity));
		anchor.MulM(b2Mat22.FromAngle(hajiki.b2Body.GetAngle()));
		anchor.Add(hajiki.b2Body.GetPosition());

		// タッチされた座標に矢印画像を生成
		arrow = new g.Sprite({
			scene: scene,
			src: scene.asset.getImageById("arrow"),
			srcWidth: 100,
			srcHeight: 100,
			x: anchor.x * worldProperty.scale,
			y: anchor.y * worldProperty.scale,
			/* アンカーの位置を矢印の先端に設定 */
			anchorX: 0,
			anchorY: 0.5,
			/* 矢印の大きさはドラッグ距離で決定 */
			scaleX: 0,
			scaleY: 0
		});
		scene.append(arrow);
	});
	hajiki.entity.onPointMove.add((event) => {
		// pointDownEventからの移動量
		const delta = physics.vec2(event.startDelta.x, event.startDelta.y);
		// 矢印の長さを変更
		const mouseMovement = delta.Length() * worldProperty.scale;
		arrow.scaleX = mouseMovement / arrow.width;
		arrow.scaleY = mouseMovement / arrow.height;
		arrow.angle = Math.atan2(delta.y, delta.x) * (180 / Math.PI);
		arrow.modified();
	});
	hajiki.entity.onPointUp.add((event) => {
		// pointDownEventからの移動量
		const delta = physics.vec2(event.startDelta.x, event.startDelta.y);
		delta.NegativeSelf();
		delta.Multiply(power);
		hajiki.b2Body.ApplyImpulse(delta, anchor);

		arrow.destroy();
		arrow = null;
	});
}

export = main;
