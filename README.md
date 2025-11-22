# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Architecture

```mermaid
graph TD
    subgraph "Google Cloud Run"
        CloudRun["Cloud Run Service"]
        Nginx["Nginx Server"]
    end

    subgraph "Browser Environment"
        User["User (Chanting)"]
        Mic["Microphone"]
        WebSpeech["Web Speech API"]
        ReactApp["React Application"]
        LocalStorage[("localStorage")]
        
        User -->|"Voice Audio"| Mic
        Mic -->|"Audio Stream"| WebSpeech
        WebSpeech -->|"Interim Transcripts"| ReactApp
        ReactApp -->|"Update Count"| ReactApp
        ReactApp -->|"Persist Count"| LocalStorage
    end

    CloudRun -->|"HTTPS Request"| Nginx
    Nginx -->|"Serve Static Files"| ReactApp

    style CloudRun fill:#f9f,stroke:#333,stroke-width:2px
    style Nginx fill:#e1f5fe,stroke:#333,stroke-width:2px
    style User fill:#fff9c4,stroke:#333,stroke-width:2px
    style Mic fill:#ffe0b2,stroke:#333,stroke-width:2px
    style WebSpeech fill:#dcedc8,stroke:#333,stroke-width:2px
    style ReactApp fill:#e1bee7,stroke:#333,stroke-width:2px
    style LocalStorage fill:#f0f4c3,stroke:#333,stroke-width:2px
```
