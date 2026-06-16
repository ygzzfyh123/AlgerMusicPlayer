import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

const MODULUS = '00e0b359e5538300032eccc812105da39963f469b45e201f11449b87c32810af1809228972b220d91b8d23468087289b43d34a475d69106294d3f3f5666b3749448834d97d740c06497e555938167f274714f32997d62054b8d7092925b9055819777174e1d521d8b28f0376c723d90615e47c1f8876c8db07802874130f142b10';
const NONCE = '0CoJUm6Qyw8W8jud';
const PUBKEY = '010001';

/**
 * 随机字符串生成
 */
function getRandomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * AES 加密
 */
function aesEncrypt(text: string, key: string): string {
  const keyWA = CryptoJS.enc.Utf8.parse(key);
  const ivWA = CryptoJS.enc.Utf8.parse('0102030405060708');
  const encrypted = CryptoJS.AES.encrypt(text, keyWA, {
    iv: ivWA,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

/**
 * RSA 加密 (大数幂模运算)
 * 网易云使用的是特定的 RSA 实现
 */
function rsaEncrypt(text: string, pubKey: string, modulus: string): string {
  // 由于标准的 JSEncrypt 处理这种非标准格式较麻烦
  // 我们直接用一个简化的逻辑实现，或者借用已有的大数逻辑
  // 这里的 text 其实是随机生成的 16 位字符串的逆序
  const reverseText = text.split('').reverse().join('');
  const crypt = new JSEncrypt();
  // 构造公钥
  const pem = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgs7NZ5VODAMPuzMgSEF2jmWP0abReIB8RRJuHwygTr4CiqXKyINkbjSNGgIcom0PTSkddaRBilNPz9WZrN0lEiDTZfXQMBkl+VVk4Fn8nRxTzKZfWIFS41wkpK5kFWBl3cU4dUh2yjwN2yNsHgCh0Ew8UKxA=
-----END PUBLIC KEY-----`;
  // 网易云的 RSA 实际上是针对固定公钥的，这里直接用固定结果或简易实现
  // 考虑到前端环境，我们将逻辑封装好
  const key = `00${modulus}`; // 这里的 modulus 是 256 位
  // ... (简化实现，实际使用时需要更精确的大数运算)
  // 为了确保 100% 可用，我将采用网易云开源 API 的精简版
  return bignum_encrypt(reverseText, pubKey, modulus);
}

// 借用网易云 API 的核心加密函数 weapi
export function weapi(data: any) {
  const text = JSON.stringify(data);
  const secretKey = getRandomString(16);
  const params = aesEncrypt(aesEncrypt(text, NONCE), secretKey);
  const encSecKey = bignum_encrypt(secretKey, PUBKEY, MODULUS);
  return { params, encSecKey };
}

/**
 * 大数加密实现 (网易云专用)
 */
function bignum_encrypt(text: string, pubKey: string, modulus: string): string {
  // 这是一个针对网易云 RSA 逻辑的纯 JS 实现
  const rs = text.split('').reverse().join('');
  let result = '';
  // 这里逻辑较复杂，我直接转换成对应的十六进制结果
  // 为了代码整洁和可靠性，这里使用一个已知的大数运算库逻辑的简化版
  // 实际上网易云的 encSecKey 是对 16 位随机码的加密
  // 由于随机码是我们生成的，这里我们使用标准的大数逻辑进行 RSA 加密
  
  // 模拟大数运算
  const biText = BigInt('0x' + CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(rs)));
  const biPubKey = BigInt('0x' + pubKey);
  const biModulus = BigInt('0x' + modulus);
  
  // (text ^ pubKey) % modulus
  let biRet = biText ** biPubKey % biModulus;
  let ret = biRet.toString(16);
  while (ret.length < 256) ret = '0' + ret;
  return ret;
}

/**
 * 跨域代理列表
 */
const CORS_PROXIES = [
  '', // 直连
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

/**
 * 本地直连 API 请求
 */
export async function standaloneRequest(url: string, data: any) {
  const { params, encSecKey } = weapi(data);
  const targetUrl = `https://music.163.com/weapi${url}?csrf_token=`;
  const body = `params=${encodeURIComponent(params)}&encSecKey=${encodeURIComponent(encSecKey)}`;

  let lastError = null;

  for (const proxy of CORS_PROXIES) {
    try {
      const fullUrl = proxy ? `${proxy}${encodeURIComponent(targetUrl)}` : targetUrl;
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://music.163.com'
        },
        body: body
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      lastError = e;
      continue;
    }
  }

  throw lastError || new Error('Standalone request failed');
}

// === 核心业务方法移植 ===

/**
 * 搜索
 */
export async function search(keywords: string, type = 1, limit = 30, offset = 0) {
  return standaloneRequest('/cloudsearch/get/web', {
    s: keywords,
    type,
    limit,
    offset,
    total: true
  });
}

/**
 * 歌单详情
 */
export async function playlistDetail(id: string | number) {
  return standaloneRequest('/v3/playlist/detail', {
    id,
    n: 100000,
    s: 8
  });
}

/**
 * 歌曲详情
 */
export async function songDetail(ids: (string | number)[]) {
  return standaloneRequest('/v3/song/detail', {
    c: JSON.stringify(ids.map(id => ({ id }))),
    ids: JSON.stringify(ids)
  });
}

/**
 * 获取播放链接 (v1)
 */
export async function songUrl(id: string | number, level = 'higher') {
  return standaloneRequest('/song/enhance/player/url/v1', {
    ids: JSON.stringify([id]),
    level: level,
    encodeType: 'flac'
  });
}

/**
 * 获取歌词
 */
export async function lyric(id: string | number) {
  return standaloneRequest('/v3/lyric', {
    id,
    lv: -1,
    tv: -1,
    rv: -1
  });
}

/**
 * 获取轮播图
 */
export async function banners(type = 0) {
  return standaloneRequest('/banner/get', { clientType: 'pc', type });
}

/**
 * 获取推荐歌单
 */
export async function personalizedPlaylist(limit = 30) {
  return standaloneRequest('/personalized/playlist', { limit, total: true, n: 1000 });
}

/**
 * 获取每日推荐歌曲
 */
export async function dayRecommend() {
  return standaloneRequest('/v1/discovery/recommend/songs', { limit: 30 });
}

/**
 * 获取热门搜索
 */
export async function hotSearch() {
  return standaloneRequest('/search/hot/detail', {});
}

/**
 * 获取搜索建议
 */
export async function searchSuggest(keywords: string) {
  return standaloneRequest('/search/suggest/web', { s: keywords });
}

/**
 * 获取推荐新歌
 */
export async function personalizedNewSong(limit = 30) {
  return standaloneRequest('/personalized/newsong', { limit, type: 'recommend' });
}
