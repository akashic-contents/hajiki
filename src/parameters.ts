import * as box2d from "@akashic-extension/akashic-box2d";

/** 2次元ベクトル */
export const b2Vec2 = box2d.Box2DWeb.Common.Math.b2Vec2;
/** 2×2 の行列 */
export const b2Mat22 = box2d.Box2DWeb.Common.Math.b2Mat22;

/** 物理世界のプロパティ */
export const worldProperty = {
	gravity: [0.0, 0.0], // 重力の方向（m/s^2）
	scale: 50, // スケール（pixel/m）
	sleep: true // 停止した物体を演算対象としないかどうか
};
/** 物理エンジンの世界 */
export const physics = new box2d.Box2D(worldProperty);

export interface HajikiParameterObject {
	/** 表示情報のパラメータ */
	appear: {
		width: number;
		height: number;
		cssColor?: string;
	};
	/** 物理定義 */
	physics: {
		/** 物理挙動 */
		body: box2d.Box2DWeb.Dynamics.b2BodyDef;
		/** 物理性質 */
		fixture: box2d.Box2DWeb.Dynamics.b2FixtureDef;
	};
};

/** おはじきのパラメータ */
export const hajikiParameter: HajikiParameterObject = {
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
export const wallParameter: HajikiParameterObject = {
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
export const floorParameter: HajikiParameterObject = {
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
