interface RequestItem {
    url: string;
    method: string;
    data: string;
    cached: boolean;
}

class RequestLog {
    private requests: RequestItem[];

    constructor() {
        this.requests = [];
    }

    add(request: RequestItem) {
        this.requests.push(request);
    }

    clear() {
        this.requests = [];
    }

    mostRecent() {
        return this.requests[this.requests.length - 1];
    }
}

export const requestLog = new RequestLog();