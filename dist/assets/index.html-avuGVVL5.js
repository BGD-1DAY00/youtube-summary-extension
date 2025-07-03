var c=Object.defineProperty;var d=(r,e,o)=>e in r?c(r,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):r[e]=o;var i=(r,e,o)=>d(r,typeof e!="symbol"?e+"":e,o);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function o(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(t){if(t.ep)return;t.ep=!0;const s=o(t);fetch(t.href,s)}})();class u{constructor(){i(this,"apiStatusIndicator");i(this,"apiStatusText");i(this,"apiForm");i(this,"apiSuccess");i(this,"providerSelect");i(this,"apiKeyInput");i(this,"saveButton");i(this,"changeButton");this.initializeElements(),this.setupEventListeners(),this.checkAPIStatus()}initializeElements(){this.apiStatusIndicator=document.getElementById("status-indicator"),this.apiStatusText=document.getElementById("status-text"),this.apiForm=document.getElementById("api-form"),this.apiSuccess=document.getElementById("api-success"),this.providerSelect=document.getElementById("provider-select"),this.apiKeyInput=document.getElementById("api-key-input"),this.saveButton=document.getElementById("save-api-key"),this.changeButton=document.getElementById("change-api-key")}setupEventListeners(){var e,o,n;this.saveButton.addEventListener("click",()=>this.saveAPIKey()),this.changeButton.addEventListener("click",()=>this.showAPIForm()),(e=document.getElementById("help-link"))==null||e.addEventListener("click",t=>{t.preventDefault(),this.showHelp()}),(o=document.getElementById("privacy-link"))==null||o.addEventListener("click",t=>{t.preventDefault(),this.showPrivacy()}),(n=document.getElementById("about-link"))==null||n.addEventListener("click",t=>{t.preventDefault(),this.showAbout()})}async checkAPIStatus(){try{const e=await chrome.storage.local.get(["youtube-ai-api-key","youtube-ai-provider"]);e["youtube-ai-api-key"]&&e["youtube-ai-provider"]?this.showAPISuccess(e["youtube-ai-provider"]):this.showAPIForm()}catch(e){console.error("Error checking API status:",e),this.showError("Failed to check API status")}}async saveAPIKey(){const e=this.providerSelect.value,o=this.apiKeyInput.value.trim();if(!e){this.showError("Please select an AI provider");return}if(!o){this.showError("Please enter your API key");return}try{await chrome.storage.local.set({"youtube-ai-api-key":o,"youtube-ai-provider":e}),this.showAPISuccess(e),this.apiKeyInput.value="",this.providerSelect.value=""}catch(n){console.error("Error saving API key:",n),this.showError("Failed to save API key")}}showAPIForm(){this.apiForm.style.display="flex",this.apiSuccess.style.display="none",this.updateStatus("warning","API key not configured")}showAPISuccess(e){this.apiForm.style.display="none",this.apiSuccess.style.display="block";const o={openai:"🧠 OpenAI",claude:"⚡ Claude",gemini:"🤖 Gemini"};this.updateStatus("success",`Connected to ${o[e]||e}`)}showError(e){this.updateStatus("error",e),setTimeout(()=>{this.checkAPIStatus()},3e3)}updateStatus(e,o){this.apiStatusIndicator.className=`status-indicator ${e==="success"?"connected":e==="error"?"error":""}`,this.apiStatusText.textContent=o}showHelp(){alert(`YouTube AI Summarizer Help

How to use:
1. Configure your API key in this popup
2. Visit any YouTube video page
3. Look for the blue "Sum" button on video thumbnails
4. Click the button to get an AI summary

Supported providers:
• OpenAI (GPT models)
• Claude (Anthropic)
• Gemini (Google)

For issues, check the console logs or reinstall the extension.`)}showPrivacy(){alert(`Privacy Policy

• Your API keys are stored locally on your device
• No data is sent to our servers
• Video analysis is done directly with your chosen AI provider
• We don't collect or store your usage data
• All communication is between you and the AI provider

Your privacy is important to us.`)}showAbout(){alert(`YouTube AI Summarizer v1.0.0

A Chrome extension that provides AI-powered summaries of YouTube videos.

Features:
• Quick video summaries
• Multiple AI provider support
• Clean, modern interface
• Privacy-focused design

Built with ❤️ for YouTube users who want to save time.`)}}document.addEventListener("DOMContentLoaded",()=>{new u});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new u}):new u;
