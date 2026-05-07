<template>
  <div class="app-root h-screen flex flex-col relative">
    <router-view />
    <div class="music-player-container">
      <button v-show="playerFolded" @click="togglePlayerFold" class="player-fold-btn" title="打开音乐播放器">
        <i class="fas fa-music"></i>
      </button>
      <div class="player-wrapper" v-show="!playerFolded">
        <div class="playlist-panel" v-show="playlistShow">
          <div class="playlist-header">
            <span>播放列表</span>
            <span class="close-playlist" @click="togglePlaylist">×</span>
          </div>
          <div class="playlist-content">
            <div v-for="(song, index) in songList" :key="song.id || index" class="playlist-item" :class="{ active: songIndex === index }" @click="playSong(index)">
              <span class="index">{{ index + 1 }}.</span>
              <span class="song-name">{{ song.name }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
          </div>
        </div>
        <div class="player-bar">
          <div class="player-row">
            <div class="player-info">
              <img :src="currentMusic.pic || 'https://picsum.photos/seed/music/40/40'" alt="封面" class="player-cover">
              <div class="player-text">
                <div class="player-title">{{ currentMusic.name || '暂无歌曲' }}</div>
                <div class="player-artist">{{ currentMusic.artist || '未知歌手' }}</div>
              </div>
              <span class="player-time">{{ formatTime(currentTime) }}</span>
            </div>
            <div class="player-controls">
              <button @click="prevSong" class="control-btn" title="上一首"><i class="fas fa-step-backward"></i></button>
              <button @click="switchPlay" class="control-btn play-btn" title="播放/暂停"><i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i></button>
              <button @click="nextSong" class="control-btn" title="下一首"><i class="fas fa-step-forward"></i></button>
              <button @click="togglePlaylist" class="control-btn" title="播放列表"><i class="fas fa-list"></i></button>
            </div>
          </div>
          <div class="player-progress"><div class="progress-track" :style="{ width: progressNum + '%' }"></div></div>
        </div>
      </div>
      <audio ref="audioEle" @timeupdate="updateProgress" @ended="nextSong" preload="auto"></audio>
    </div>
  </div>
</template>

<style>
html, body { height: 100%; margin: 0; }
.music-player-container { position: fixed; bottom: 20px; right: 20px; z-index: 99999; }
.player-fold-btn { width: 50px; height: 50px; border-radius: 50%; background: #1677ff; color: white; border: none; font-size: 20px; cursor: pointer; box-shadow: 0 5px 15px rgba(22, 119, 255, 0.3); display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.player-fold-btn:hover { background: #0f6adc; transform: scale(1.1); }
.player-close-btn { position: absolute; top: 8px; right: 12px; background: none; border: none; color: #999; font-size: 16px; cursor: pointer; z-index: 10; }
.player-close-btn:hover { color: #ff4d4f; }
.player-wrapper { width: 360px; background: #fff; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.15); overflow: hidden; position: relative; }
.dark .player-wrapper { background: #1f2937; }
.playlist-panel { max-height: 200px; overflow-y: auto; border-bottom: 1px solid #eee; }
.dark .playlist-panel { border-color: #374151; }
.playlist-header { padding: 10px 15px; display: flex; justify-content: space-between; font-weight: bold; }
.dark .playlist-header { color: #f9fafb; }
.close-playlist { cursor: pointer; color: #666; }
.playlist-item { display: flex; align-items: center; padding: 8px 15px; cursor: pointer; }
.playlist-item:hover { background: #f5f5f5; }
.dark .playlist-item:hover { background: #374151; }
.playlist-item.active { background: #e6f7ff; color: #1677ff; }
.dark .playlist-item.active { background: #1e3a5f; color: #60a5fa; }
.index { width: 30px; color: #999; }
.song-name { flex: 1; margin: 0 10px; }
.song-artist { color: #666; font-size: 12px; }
.dark .song-artist { color: #9ca3af; }
.player-bar { padding: 10px 12px; }
.player-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.player-info { display: flex; align-items: center; gap: 8px; flex: 1; }
.player-cover { width: 36px; height: 36px; border-radius: 4px; object-fit: cover; }
.player-text { flex: 1; min-width: 100px; }
.player-title { font-size: 13px; font-weight: 500; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dark .player-title { color: #f9fafb; }
.player-artist { font-size: 11px; color: #666; }
.dark .player-artist { color: #9ca3af; }
.player-time { font-size: 11px; color: #999; white-space: nowrap; }
.player-controls { display: flex; gap: 12px; }
.control-btn { background: none; border: none; cursor: pointer; color: #666; font-size: 14px; }
.control-btn:hover { color: #1677ff; }
.dark .control-btn { color: #9ca3af; }
.dark .control-btn:hover { color: #60a5fa; }
.play-btn { font-size: 16px; }
.player-progress { height: 3px; background: #eee; border-radius: 2px; overflow: hidden; }
.dark .player-progress { background: #374151; }
.progress-track { height: 100%; background: #1677ff; transition: width 0.1s linear; }

/* ====================== 【仅新增】方案1：自适应文字阴影 ====================== */
/* 浅色模式文字阴影（白色描边，适配深色背景） */
.player-title,
.player-artist,
.player-time,
.playlist-header,
.playlist-item .index,
.playlist-item .song-name,
.playlist-item .song-artist {
  text-shadow: 0 0 3px rgba(255,255,255,0.8), 0 1px 2px rgba(255,255,255,0.5);
}
/* 深色模式文字阴影（黑色描边，适配浅色背景） */
.dark .player-title,
.dark .player-artist,
.dark .player-time,
.dark .playlist-header,
.dark .playlist-item .index,
.dark .playlist-item .song-name,
.dark .playlist-item .song-artist {
  text-shadow: 0 0 3px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.6);
}
</style>

<script>
export default {
  data() {
    return {
      isPlaying: false,
      songList: [],
      songIndex: 0,
      currentMusic: {},
      progressNum: 0,
      currentTime: 0,
      playlistShow: false,
      audioLock: false,
      playerFolded: true, // 默认右下角悬浮隐藏
      // 闲置计时器配置
      idleTimer: null,
      idleDelay: 3000 // 3秒无操作自动隐藏播放器（可自行修改时长）
    };
  },
  methods: {
    // 多API自动轮询加载歌单（4个备用接口，自动切换）
    async getNeteasePlaylist(id) {
      // 备用API列表，一个失效自动跳下一个
      const API_LIST = [
        "https://api.injahow.cn/meting/",
        "https://meting.qjqq.cn/",
        "https://api.zhym.club/meting/",
        "https://meting-api.ixcmstudio.cn/"
      ];

      for (const api of API_LIST) {
        try {
          // 带时间戳，强制刷新，不走缓存
          const res = await fetch(`${api}?server=netease&type=playlist&id=${id}&t=${Date.now()}`);
          if (!res.ok) continue;
          const list = await res.json();
          
          // 获取到有效歌曲列表，赋值并退出循环
          if (list && list.length > 0) {
            this.songList = list;
            this.currentMusic = list[0];
            this.songIndex = 0;
            console.log("歌单加载成功，使用接口：", api);
            return;
          }
        } catch (err) {
          // 接口报错，跳过，尝试下一个
          continue;
        }
      }

      // 所有接口都失效
      console.error("所有音乐接口均失效，请稍后重试");
    },
    // 折叠/展开播放器
    togglePlayerFold() {
      this.playerFolded = !this.playerFolded;
    },
    // 点击页面自动播放
    initAutoPlay() {
      const handler = () => {
        if (this.songList.length === 0 || this.audioLock) return;
        this.playSong(0);
        document.removeEventListener('click', handler);
      };
      document.addEventListener('click', handler, { once: true });
    },
    // 播放指定歌曲
    playSong(index) {
      if (this.audioLock) return;
      this.audioLock = true;
      const audio = this.$refs.audioEle;
      
      audio.pause();
      audio.src = '';
      audio.load();
      this.songIndex = index;
      this.currentMusic = this.songList[index];
      audio.src = this.currentMusic.url;
      
      audio.play().then(() => {
        this.isPlaying = true;
        this.audioLock = false;
      }).catch(() => {
        this.isPlaying = false;
        this.audioLock = false;
      });
    },
    // 播放/暂停切换
    switchPlay() {
      const audio = this.$refs.audioEle;
      this.isPlaying ? audio.pause() : audio.play();
      this.isPlaying = !this.isPlaying;
    },
    // 上一首
    prevSong() {
      const idx = this.songIndex - 1 < 0 ? this.songList.length - 1 : this.songIndex - 1;
      this.playSong(idx);
    },
    // 下一首
    nextSong() {
      const idx = (this.songIndex + 1) % this.songList.length;
      this.playSong(idx);
    },
    // 更新播放进度
    updateProgress() {
      const a = this.$refs.audioEle;
      if (!a?.duration) return;
      this.currentTime = a.currentTime;
      this.progressNum = (a.currentTime / a.duration) * 100;
    },
    // 时间格式化
    formatTime(s) {
      if (isNaN(s)) return '00:00';
      const m = Math.floor(s / 60);
      const sc = Math.floor(s % 60);
      return `${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
    },
    // 显示/隐藏播放列表
    togglePlaylist() {
      this.playlistShow = !this.playlistShow;
    },

    // 重置闲置计时器（无侵入）
    resetIdleTimer() {
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        this.playerFolded = true; // 超时自动隐藏播放器
      }, this.idleDelay);
    },

    // 全局点击监听（非播放器区域自动隐藏）
    handleGlobalClick(e) {
      const playerEl = document.querySelector('.music-player-container');
      // 点击区域不在播放器内 → 自动隐藏
      if (playerEl && !playerEl.contains(e.target) && !this.playerFolded) {
        this.playerFolded = true;
      }
    }
  },
  mounted() {
    // 原代码逻辑完全不变
    const targetId = localStorage.getItem('neteasePlaylistId') || '44119167';
    this.getNeteasePlaylist(targetId);
    this.$nextTick(() => this.initAutoPlay());

    // 自动隐藏初始化（无侵入）
    this.resetIdleTimer(); // 初始化闲置计时
    document.addEventListener('click', this.handleGlobalClick); // 全局点击监听
    document.addEventListener('mousemove', this.resetIdleTimer); // 鼠标操作重置计时
    document.addEventListener('keydown', this.resetIdleTimer); // 键盘操作重置计时
  },
  beforeUnmount() {
    // 原代码逻辑完全不变
    if (this.$refs.audioEle) {
      this.$refs.audioEle.pause();
      this.$refs.audioEle.src = '';
    }

    // 清理计时器/事件（防止内存泄漏）
    clearTimeout(this.idleTimer);
    document.removeEventListener('click', this.handleGlobalClick);
    document.removeEventListener('mousemove', this.resetIdleTimer);
    document.removeEventListener('keydown', this.resetIdleTimer);
  }
};
</script>