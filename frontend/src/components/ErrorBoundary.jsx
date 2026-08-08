import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Production-safe logging: no stack traces are shown to the user.
        console.error('Unexpected UI error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: 24 }}>
                    <div style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
                        <h1 style={{ fontSize: 'clamp(22px,4vw,28px)', margin: '0 0 8px' }}>Something went wrong.</h1>
                        <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px' }}>
                            An unexpected error occurred. Please reload the application.
                        </p>
                        <button onClick={this.handleReload} className="btn btn-primary">
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
