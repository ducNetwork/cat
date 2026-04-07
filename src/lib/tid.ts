class TID {
  private readonly CHARS = '234567abcdefghijklmnopqrstuvwxyz';
  
  readonly CLOCK_ID: number;
  private last_timestamp: bigint = BigInt(0);

  constructor(id?: number) {
    this.CLOCK_ID = id ?? Math.floor(Math.random() * 1023);
  }

  generate(milliseconds: number | bigint = Date.now()) {
    let timestamp = BigInt(Number(milliseconds) * 1000);

    if (timestamp <= this.last_timestamp) {
      timestamp = this.last_timestamp + BigInt(1);
    }

    this.last_timestamp = timestamp;

    let tid = BigInt(0);

    tid = tid | (BigInt(timestamp.valueOf()) << BigInt(10));
    tid = tid | BigInt(this.CLOCK_ID % 1024);

    return this.encodeBase32(tid);
  }

  private encodeBase32(num: bigint): string {
    let out = '';

    while (num > BigInt(0)) {
      const idx = Number(num & BigInt(31));
      out = this.CHARS[idx] + out;
      num >>= BigInt(5);
    }

    return out.padStart(13, '2');
  }
}

export const tid = new TID();