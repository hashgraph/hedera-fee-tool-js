/*-
 * ‌
 * Hedera Fee Tool
 * ​
 * Copyright (C) 2019 - 2020 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

class Utils {
  static truncateDecimal(val, limit) {
    let tValArray = val.toString().split('.'),
      formattedVal = val;

    if (tValArray.length > 1 && tValArray[1] !== undefined && tValArray[1].length > limit) {
      tValArray[1] = tValArray[1].slice(0, limit);

      if (parseFloat(tValArray[1]) === 0) {
        tValArray[1] = 0;
      }

      while (tValArray[1].length > 1 && tValArray[1].slice(-1) === '0') {
        tValArray[1] = tValArray[1].slice(0, tValArray[1].length - 1);
      }
      formattedVal = tValArray[0] + '.' + tValArray[1];
    }
    return formattedVal;
  }
}

export default Utils;